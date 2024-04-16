<template>
  <BasePanel
    v-model="state.panel"
    bg-color="#EEF5FA"
    icon="mdi-share-variant"
    :title="state.title"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #content>
      <v-card class="mb-3 rounded-0 rounded-b">
        <v-card-text class="pa-3">
          <v-tabs v-model="tab" class="rounded-t" height="40" @change="tabChanged">
            <v-tab v-for="item in tabItems" :key="item.value">
              <BaseLogo class="mr-2" default-logo="mdi:shape" :icon-name="item.icon" :ml="0" :mt="1" :width="20" />
              {{ item.text }} <span v-if="item.value === ''">({{ pagination.total }})</span>
            </v-tab>
            <span :style="{ width: '300px' }" />
            <v-text-field
              v-model="pagination.search"
              class="ml-2"
              dense
              flat
              full-width
              hide-details
              :placeholder="i18nLocal.t('filter.name')"
              prepend-inner-icon="mdi-magnify"
              solo
              @keyup.enter="search"
            />
          </v-tabs>
        </v-card-text>
      </v-card>

      <div
        id="open__set"
        class="mx-3"
        :style="{ height: `calc((100vh - 128px) / ${store.state.Scale})`, overflowY: 'auto', overflowX: 'hidden' }"
      >
        <v-row v-scroll:#open__set="_.debounce(scrolled, 50)" class="mt-0">
          <v-col v-for="(item, index) in pagination.items" :key="index" class="pt-0" cols="6">
            <SetCard :key="item.key || `set_${index}`" :item="item" :kind="state.kind" @viewSet="viewSet" />
          </v-col>
        </v-row>

        <div v-if="state.loading" class="my-3 py-2 text-center card__scroll__loading">
          <BaseDropProgress :progress="config.layout.PLATFORM" />
        </div>
      </div>
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import { convertResponse2List, convertResponse2Pagination } from '@kubegems/api/utils';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { beautifyFloatNum, beautifyStorageUnit, randomString } from '@kubegems/libs/utils/helpers';
  import _ from 'lodash';
  import { computed, reactive, ref } from 'vue';
  import { useRequest } from 'vue-request';

  import { SetBase } from '../../api/base';
  import { Dataset } from '../../api/dataset';
  import { Modelset } from '../../api/modelset';
  import { AsyncTask } from '../../api/task';
  import { useI18n } from './i18n';
  import SetCard from './SetCard.vue';

  const store = useStore();
  const i18nLocal = useI18n();

  const state = reactive({
    panel: false,
    title: '',
    kind: '',
    loading: false,
  });

  const tab = ref(0);
  const tabItems = computed(() => {
    return [{ text: i18nLocal.t('tip.al'), value: '', icon: 'mdi:all-inclusive' }];
  });
  const tabChanged = async (): Promise<void> => {
    pagination.page = 1;
    getPublicSetList();
  };

  const dispose = (): void => {
    if (_cancel) _cancel();
    return;
  };

  let pagination: Pagination<Modelset | Dataset> = reactive<Pagination<Modelset | Dataset>>({
    page: 1,
    size: 16,
    pageCount: 0,
    items: [],
    search: '',
    total: 0,
    noprocessing: false,
  });

  const search = () => {
    tabChanged();
  };

  const getPublicSetList = async (params: KubePaginationRequest = pagination, append = false): Promise<void> => {
    const p = {
      page: params.page,
      size: params.size,
      noprocessing: append || params.noprocessing,
      search: params.search || '',
      tenant: ['', 'platform'].indexOf(tabItems.value[tab.value].value) > -1 ? '' : tabItems.value[tab.value].value,
      'local-shared-only': tabItems.value[tab.value].value === 'platform',
    };
    const data =
      state.kind === 'modelset'
        ? await new Modelset({ region: store.getters.Region().RegionName }).getPublicModelsetList(p)
        : await new Dataset({ region: store.getters.Region().RegionName }).getPublicDatasetList(p);

    if (append) {
      pagination.items = pagination.items.concat(convertResponse2Pagination<Modelset | Dataset>(data).items);
    } else {
      pagination = Object.assign(pagination, convertResponse2Pagination<Modelset | Dataset>(data));
    }
    const metrics = await new SetBase().getSetBucketMetrics(
      pagination.items.map((p) => {
        return p.status.bucket;
      }),
      { noprocessing: true },
    );
    pagination.items.forEach((p) => {
      p.status.size = beautifyStorageUnit(parseFloat(metrics.size[p.status.bucket] || '0'));
      p.status.count = beautifyFloatNum(parseInt(metrics.count[p.status.bucket] || '0'), 0);
      p.key = randomString(6);
    });
    pagination.items = pagination.items.slice();
  };

  const getAsyncTaskList = async () => {
    const names = pagination.items.map((item) => {
      return item.name;
    });
    const data = await new AsyncTask({
      tenant: store.getters.Tenant().TenantName,
      region: store.getters.Region().RegionName,
    }).getTaskList({
      page: 1,
      size: 1000,
      noprocessing: true,
      'storageset-names': names.join(','),
      'storageset-kinds': state.kind,
    });
    convertResponse2List(data).forEach((task) => {
      const index = pagination.items.findIndex((item) => {
        return item.name === task.storageSetName;
      });
      if (index > -1) {
        const [downloader] = pagination.items[index].downloaders;
        if (downloader) {
          downloader.phase = task.phase;
          downloader.message = task.message;
          downloader.startTimestamp = task.startTimestamp;
        }
        pagination.items[index].downloaders = [downloader];
      }
    });
    pagination.items = pagination.items.slice();
  };

  const offsetTop = ref<number>(0);
  const scrolled = async (e): Promise<void> => {
    offsetTop.value = e.target.scrollTop;
    if (e.target.scrollTop + document.getElementById('open__set').clientHeight >= e.target.scrollHeight - 1) {
      if (pagination.pageCount <= pagination.page) return;
      pagination.page += 1;
      state.loading = true;
      await getPublicSetList(pagination, true);
      state.loading = false;
    }
  };

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  const open = async (title: string, kind: string): Promise<void> => {
    state.title = title;
    state.kind = kind;
    state.panel = true;
    if (_cancel) _cancel();
    await tabChanged();
    const { cancel } = useRequest(getAsyncTaskList, {
      pollingInterval: 1000 * 30,
      onSuccess: () => {
        pagination.noprocessing = true;
      },
    });
    _cancel = cancel;
  };
  defineExpose({
    open,
  });

  const emit = defineEmits(['viewSet']);
  const viewSet = (item: Modelset | Dataset) => {
    emit('viewSet', item);
  };
</script>

<style lang="scss" scoped>
  .card {
    position: relative;

    &__scroll {
      &__loading {
        position: relative;
        height: 70px;
      }
    }
  }
</style>
