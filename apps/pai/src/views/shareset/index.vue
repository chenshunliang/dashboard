<!--
 * kubegems-pai
 * Copyright (C) 2023  kubegems.io
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <RegionSelect v-model="region" class="float-left" />
          <div class="kubegems__clear-float" />
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-card class="mb-3 rounded">
      <v-card-text class="pa-3">
        <v-tabs v-model="tab" class="rounded-t" height="40" @change="tabChanged">
          <v-tab v-for="item in tabItems" :key="item.value">
            <BaseLogo class="mr-2" :icon-name="item.icon" :ml="0" :mt="1" :width="20" />
            {{ item.text }}
          </v-tab>
          <v-spacer />
          <BaseFilter1 :default="{ items: [], text: i18nLocal.t('filter.name'), value: 'search' }" :filters="filters" />
        </v-tabs>
      </v-card-text>
    </v-card>

    <div
      id="open__set"
      :style="{ height: `calc((100vh - 260px) / ${store.state.Scale})`, overflowY: 'auto', overflowX: 'hidden' }"
    >
      <v-row v-scroll:#open__set="_.debounce(scrolled, 50)" class="mt-0">
        <v-col v-for="(item, index) in pagination.items" :key="index" class="pt-0" cols="3">
          <SetCard
            :key="item.key || `shareset_${index}`"
            apply-for="management"
            :item="item"
            :kind="tab === 0 ? 'modelset' : 'dataset'"
            @editSet="editSet"
            @removeSet="removeSet"
            @viewSet="viewSet"
          />
        </v-col>
        <v-col class="pt-0" cols="3">
          <v-hover #default="{ hover }">
            <v-card
              class="kubegems__full-height kubegems__pointer"
              :elevation="hover ? 5 : 0"
              flat
              min-height="229"
              @click="createSet"
            >
              <v-card-text class="pa-0 kubegems__full-height">
                <v-list-item class="kubegems__full-height" three-line>
                  <v-list-item-content>
                    <div block class="text-h6 primary--text text-center">
                      <v-icon class="mt-n1" color="primary">mdi-plus-box</v-icon>
                      {{
                        i18nLocal.t('operate.create_c', [
                          tab === 0 ? i18nLocal.t('resource.model') : i18nLocal.t('resource.dataset'),
                        ])
                      }}
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>

      <div v-if="state.loading" class="my-3 py-2 text-center card__scroll__loading">
        <BaseDropProgress :progress="config.layout.PLATFORM" />
      </div>
    </div>

    <v-btn
      bottom
      class="card__top"
      color="primary"
      direction="left"
      fab
      fixed
      right
      transition="slide-x-reverse-transition"
      @click="createSet"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-btn
      v-if="offsetTop"
      bottom
      class="card__top_s"
      color="primary"
      direction="left"
      fab
      fixed
      right
      transition="slide-x-reverse-transition"
      @click="goToTop"
    >
      <v-icon>mdi-chevron-double-up</v-icon>
    </v-btn>

    <ViewSet ref="viewer" />
    <ModelForm ref="model" share @refresh="getPublicSetList" />
    <DatasetForm ref="dataset" share @refresh="getPublicSetList" />
  </v-container>
</template>

<script lang="ts" setup>
  import { convertResponse2List, convertResponse2Pagination } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { beautifyFloatNum, beautifyStorageUnit, randomString, sleep } from '@kubegems/libs/utils/helpers';
  import _ from 'lodash';
  import { onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { SetBase } from '../../api/base';
  import { Dataset } from '../../api/dataset';
  import { Modelset } from '../../api/modelset';
  import { AsyncTask } from '../../api/task';
  import RegionSelect from '../components/RegionSelect.vue';
  import SetCard from '../components/SetCard.vue';
  import ViewSet from '../components/ViewSet.vue';
  import DatasetForm from '../dataset/components/DatasetForm/index.vue';
  import ModelForm from '../modelset/components/ModelForm/index.vue';
  import { useI18n } from './i18n';

  const store = useStore();
  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const state = reactive({
    loading: false,
  });

  const tab = ref(0);
  const tabItems = [
    { text: i18nLocal.t('resource.model'), value: 'modelset', icon: 'mdi:cube' },
    { text: i18nLocal.t('resource.dataset'), value: 'dataset', icon: 'mdi:database' },
  ];
  const tabChanged = (): void => {
    pagination.page = 1;
    pagination.items = [];
    pagination.noprocessing = false;
    getPublicSetList();
  };

  let pagination: Pagination<SetBase> = reactive<Pagination<SetBase>>({
    page: 1,
    size: 16,
    pageCount: 0,
    items: [],
    search: '',
    noprocessing: false,
    source: '',
  });

  const getPublicSetList = async (params: KubePaginationRequest = pagination, append = false): Promise<void> => {
    const data =
      tab.value === 0
        ? await new Modelset({
            region: region.value.name,
          }).getPublicModelsetList({
            page: params.page,
            size: params.size,
            noprocessing: append || params.noprocessing,
            search: params.search || query.value.search || '',
            tenant: 'default',
            source: params.source || query.value.source || '',
          })
        : await new Dataset({
            region: region.value.name,
          }).getPublicDatasetList({
            page: params.page,
            size: params.size,
            noprocessing: append || params.noprocessing,
            search: params.search || query.value.search || '',
            tenant: 'default',
            source: params.source || query.value.source || '',
          });

    if (append) {
      pagination.items = pagination.items.concat((convertResponse2Pagination(data as any) as any).items);
    } else {
      pagination = Object.assign(pagination, convertResponse2Pagination(data as any));
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
    pagination.noprocessing = true;
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
      'storageset-kinds': tabItems[tab.value].value,
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

  const filters = [
    { text: i18nLocal.t('filter.name'), value: 'search', items: [] },
    {
      text: i18nLocal.t('filter.source'),
      value: 'source',
      items: [
        {
          text: i18nLocal.t('tip.default'),
          value: 'default',
          parent: 'source',
        },
        {
          text: 'HuggingFace',
          value: 'huggingface',
          parent: 'source',
        },
        {
          text: 'ModelX',
          value: 'modelx',
          parent: 'source',
        },
        {
          text: 'URI',
          value: 'uri',
          parent: 'source',
        },
      ],
    },
  ];
  const query = useQuery();
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.search) {
        pagination.search = newValue.value.search;
      } else {
        pagination.search = '';
      }
      if (newValue.value.source) {
        pagination.source = newValue.value.source;
      } else {
        pagination.source = '';
      }
      pagination.page = 1;
      getPublicSetList();
    },
    {
      deep: true,
    },
  );

  const region = ref(void 0);
  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  watch(
    () => region.value,
    async (newValue) => {
      if (newValue) {
        if (_cancel) _cancel();
        await getPublicSetList();
        const { cancel } = useRequest(getAsyncTaskList, {
          pollingInterval: 1000 * 30,
        });
        _cancel = cancel;
      }
    },
    { deep: true, immediate: true },
  );
  onUnmounted(() => {
    if (_cancel) _cancel();
  });

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

  const goToTop = () => {
    const container = document.getElementById('open__set');
    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const viewer = ref(null);
  const viewSet = (item: Dataset): void => {
    viewer.value.open();
    viewer.value.init(item, `${i18nLocal.t('resource.model')} ${item.name}`);
  };

  const editSet = (item: SetBase) => {
    if (tab.value === 0) {
      model.value.init(item);
      model.value.open();
    } else {
      dataset.value.init(item);
      dataset.value.open();
    }
  };

  const removeSet = (item: SetBase) => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [
        tab.value === 0 ? i18nLocal.t('resource.model') : i18nLocal.t('resource.dataset'),
      ]),
      content: {
        text: `${i18n.t('operate.delete_c', [
          tab.value === 0 ? i18nLocal.t('resource.model') : i18nLocal.t('resource.dataset'),
        ])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          tab.value === 0
            ? await new Modelset(param.item).deleteModelset()
            : await new Dataset(param.item).deleteDataset();

          await sleep(500);
          getPublicSetList();
        }
      },
    });
  };

  const model = ref(null);
  const dataset = ref(null);
  const createSet = () => {
    if (tab.value === 0) model.value.open();
    else dataset.value.open();
  };
</script>

<style lang="scss" scoped>
  .card {
    &__top_s {
      bottom: 130px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }

    &__top {
      bottom: 75px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }

    &__scroll {
      &__loading {
        position: relative;
        height: 70px;
      }
    }
  }
</style>
