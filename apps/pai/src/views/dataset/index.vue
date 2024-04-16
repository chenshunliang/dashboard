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
    <BaseRegionHeader />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn class="primary--text" small text @click="viewShareSet">
            <v-icon left small>mdi-share-variant</v-icon>
            {{ i18nLocal.t('tip.share_dataset') }}
          </v-btn>
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <template v-if="useQueueCheck()">
      <v-card>
        <v-card-text class="pa-3">
          <v-tabs
            v-model="tab"
            class="rounded-t"
            height="40"
            @change="getDatasetList({ page: 1, size: 16, noprocessing: false })"
          >
            <v-tab v-for="item in tabItems" :key="item.tab">
              <BaseLogo class="mr-2" :icon-name="item.tab" :ml="0" :mt="1" :width="20" />
              {{ item.text }} <span v-if="item.index === tab" class="tab__count">({{ pagination.total }})</span>
            </v-tab>
            <v-spacer />
            <BaseFilter1
              :default="{ items: [], text: i18nLocal.t('filter.name'), value: 'search' }"
              :filters="filters"
            />
            <v-switch
              v-model="filterCreator"
              class="ml-3 mt-2"
              hide-details
              :label="i18nLocal.t('tip.view_my')"
              @change="filterCreatorChanged"
            />
          </v-tabs>
        </v-card-text>
      </v-card>

      <div
        id="data__set"
        class="card"
        :style="{ height: `calc((100vh - 260px) / ${store.state.Scale})`, overflowY: 'auto', overflowX: 'hidden' }"
      >
        <v-row v-scroll:#data__set="_.debounce(scrolled, 50)" class="mt-3">
          <v-col v-for="(item, index) in pagination.items" :key="index" class="pt-0" cols="3">
            <SetCard
              :key="item.key || `dataset_${index}`"
              apply-for="self"
              :item="item"
              kind="dataset"
              @editSet="editDataset"
              @privateSet="privateDataset"
              @publicSet="openDataset"
              @removeSet="removeDataset"
              @viewSet="viewSet"
            />
          </v-col>
          <v-col class="pt-0" cols="3">
            <v-hover #default="{ hover }">
              <v-card
                class="kubegems__full-height kubegems__pointer"
                :elevation="hover ? 5 : 0"
                flat
                min-height="233"
                @click="createDataset"
              >
                <v-card-text class="pa-0 kubegems__full-height">
                  <v-list-item class="kubegems__full-height" three-line>
                    <v-list-item-content>
                      <div block class="text-h6 primary--text text-center">
                        <v-icon class="mt-n1" color="primary">mdi-plus-box</v-icon>
                        {{ i18nLocal.t('operate.create_c', [i18nLocal.t('resource.dataset')]) }}
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

        <v-btn
          bottom
          class="card__top"
          color="primary"
          direction="left"
          fab
          fixed
          right
          transition="slide-x-reverse-transition"
          @click="createDataset"
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
      </div>
    </template>

    <BaseQueuePremission v-else />

    <DatasetForm ref="dataset" @refresh="getDatasetList({ page: 1, size: 16, noprocessing: false })" />
    <ViewSet ref="viewer" />
    <ShareSet ref="share" @viewSet="viewSet" />
  </v-container>
</template>

<script lang="ts" setup>
  import { convertResponse2List, convertResponse2Pagination } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { PAI_DATASET_CATALOG_KEY } from '@kubegems/libs/constants/label';
  import { beautifyFloatNum, beautifyStorageUnit, randomString, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { stringifySelector } from '@kubegems/libs/utils/k8s_selector';
  import _ from 'lodash';
  import { onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { SetBase } from '../../api/base';
  import { Dataset } from '../../api/dataset';
  import { AsyncTask } from '../../api/task';
  import { usePreCheck, useQueueCheck } from '../../hooks/precheck';
  import SetCard from '../components/SetCard.vue';
  import ShareSet from '../components/ShareSet.vue';
  import ViewSet from '../components/ViewSet.vue';
  import DatasetForm from './components/DatasetForm/index.vue';
  import { useI18n } from './i18n';

  const i18nLocal = useI18n();
  const store = useStore();
  const i18n = useGlobalI18n();

  const tab = ref(0);
  const tabItems = [
    { text: i18nLocal.t('tab.all'), value: 'all', tab: 'mdi:all-inclusive', index: 0 },
    { text: i18nLocal.t('tab.text'), value: 'text', tab: 'text', index: 1 },
    { text: i18nLocal.t('tab.img'), value: 'image', tab: 'image', index: 2 },
    { text: i18nLocal.t('tab.audio'), value: 'audio', tab: 'audio', index: 3 },
    { text: i18nLocal.t('tab.video'), value: 'video', tab: 'video', index: 4 },
    { text: i18nLocal.t('tab.common'), value: 'generic', tab: 'mdi:database', index: 5 },
  ];

  let pagination: Pagination<Dataset> = reactive<Pagination<Dataset>>({
    page: 1,
    size: 16,
    pageCount: 0,
    items: [],
    search: '',
    total: 0,
    noprocessing: false,
  });

  const filterCreator = ref(false);
  const filterCreatorChanged = (): void => {
    getDatasetList({ page: 1, size: 16, noprocessing: false });
  };

  const getDatasetList = async (params: KubePaginationRequest = pagination, append = false): Promise<void> => {
    if (!append) pagination.total = 0;
    const labelSelector: string =
      tab.value === 0
        ? null
        : stringifySelector({
            matchExpressions: [
              {
                key: PAI_DATASET_CATALOG_KEY,
                operator: 'in',
                values: [tabItems[tab.value].value],
              },
            ],
          });
    const data = await new Dataset({
      tenant: store.getters.Tenant().TenantName,
      region: store.getters.Region().RegionName,
    }).getDatasetList({
      page: params.page,
      size: params.size,
      noprocessing: append || params.noprocessing,
      search: params.search || '',
      creator: filterCreator.value ? store.state.User.Username : '',
      'label-selector': labelSelector,
    });

    if (append) {
      pagination.items = pagination.items.concat(convertResponse2Pagination(data).items);
    } else {
      pagination = Object.assign(pagination, convertResponse2Pagination(data));
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
      p.status.progress = (sizeOfStorage(p.status.size) / sizeOfStorage(p?.config?.capacity || '0')) * 100;
      p.status.color = p.status.progress > 90 ? 'red darken-1' : p.status.progress > 80 ? 'orange' : 'primary';
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
      'storageset-kinds': 'dataset',
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

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  const filters = [{ text: i18nLocal.t('filter.name'), value: 'search', items: [] }];
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
      pagination.page = 1;
      if (!usePreCheck() || !useQueueCheck()) return;
      await getDatasetList();
      if (_cancel) _cancel();
      const { cancel } = useRequest(getAsyncTaskList, {
        pollingInterval: 1000 * 30,
      });
      _cancel = cancel;
    },
    {
      deep: true,
      immediate: true,
    },
  );
  onUnmounted(() => {
    if (_cancel) _cancel();
  });

  const dataset = ref(null);
  const createDataset = (): void => {
    dataset.value.open();
  };

  const editDataset = (item: Dataset): void => {
    dataset.value.init(item);
    dataset.value.open();
  };

  const removeDataset = (item: Dataset): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('resource.dataset')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('resource.dataset')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new Dataset(param.item).deleteDataset();
          getDatasetList();
        }
      },
    });
  };

  const openDataset = (item: Dataset): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.open_c', [i18nLocal.t('resource.dataset')]),
      content: {
        text: `${i18nLocal.t('operate.open_c', [i18nLocal.t('resource.dataset')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          param.item.public = true;
          await new Dataset(param.item).updateDataset();
          getDatasetList();
        }
      },
    });
  };

  const privateDataset = (item: Dataset): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.private_c', [i18nLocal.t('resource.dataset')]),
      content: {
        text: `${i18nLocal.t('operate.private_c', [i18nLocal.t('resource.dataset')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          param.item.public = false;
          await new Dataset(param.item).updateDataset();
          getDatasetList();
        }
      },
    });
  };

  const viewer = ref(null);
  const viewSet = (item: Dataset): void => {
    viewer.value.open();
    viewer.value.init(item, `${i18nLocal.t('resource.dataset')} ${item.name}`);
  };

  const share = ref(null);
  const viewShareSet = (): void => {
    share.value.open(i18nLocal.t('tip.share_dataset'), 'dataset');
  };

  const offsetTop = ref<number>(0);
  const state = reactive({
    loading: false,
  });
  const scrolled = async (e): Promise<void> => {
    offsetTop.value = e.target.scrollTop;
    if (e.target.scrollTop + document.getElementById('data__set').clientHeight >= e.target.scrollHeight - 10) {
      if (pagination.pageCount <= pagination.page) return;
      pagination.page += 1;
      state.loading = true;
      await getDatasetList(pagination, true);
      state.loading = false;
    }
  };

  const goToTop = () => {
    const container = document.getElementById('data__set');
    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
</script>

<style lang="scss" scoped>
  .card {
    position: relative;

    &__linear {
      position: absolute;
      left: 0;
      bottom: 0;
    }

    &__name {
      white-space: nowrap;
      overflow: auto;
      word-break: break-word;
      text-overflow: ellipsis;
      max-width: 80%;
    }

    &__title {
      word-break: break-word;
      white-space: break-spaces;
      font-weight: bold;
      min-height: 38px;
      max-height: 57px;
    }

    &__top {
      bottom: 75px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }

    &__top_s {
      bottom: 130px;
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

    &__desc {
      line-height: 24px;

      &__wd {
        min-width: 145px;
      }
    }

    &__content {
      max-height: 105px;
      overflow: auto;
      white-space: normal;
      word-break: break-word;
      font-size: 15px;
      color: rgba(0, 0, 0, 0.6);
      line-height: 22px;
    }
  }

  .watermark {
    position: absolute;
    color: grey;
    opacity: 0.5;
    font-size: 1rem;
    rotate: -35deg;
    font-weight: 300;
    text-shadow: 0 0 2px #444444;
  }

  .status {
    margin-top: 4px;
    margin-left: 4px;

    &__tip {
      padding: 2px;
      padding-left: 4px;
      border-radius: 3px;
    }
  }

  .tab {
    &__count {
      width: 50px;
    }
  }
</style>
