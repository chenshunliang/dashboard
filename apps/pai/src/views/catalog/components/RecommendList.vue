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
  <div class="mt-6">
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
          <v-hover #default="{ hover }">
            <v-card class="mx-auto pa-3" :elevation="hover ? 5 : 0" flat height="100%">
              <div class="text-h6 primary--text">
                <v-menu
                  v-if="item.name.length > 30"
                  bottom
                  :close-delay="200"
                  max-width="350"
                  min-width="80"
                  open-on-hover
                  right
                >
                  <template #activator="{ on }">
                    <div class="float-left card__name" v-on="on">
                      <div class="float-left">
                        <BaseLogo default-logo="pai" :icon-name="getIcon(item)" :ml="0" :width="32" />
                      </div>
                      <div class="float-left ml-2 card__name__t">
                        {{ item.name }}
                      </div>
                      <div class="kubegems__clear-float" />
                    </div>
                  </template>
                  <v-card>
                    <v-card-text class="pa-3 text-body-2"> {{ item.name }} </v-card-text>
                  </v-card>
                </v-menu>
                <div v-else class="float-left card__name">
                  <div class="float-left">
                    <BaseLogo default-logo="pai" :icon-name="getIcon(item)" :ml="0" :width="32" />
                  </div>
                  <div class="float-left ml-2">
                    {{ item.name }}
                  </div>
                  <div class="kubegems__clear-float" />
                </div>

                <div class="float-left text-caption status">
                  <JobStatusTip v-if="getStatus(item) !== 'completed'" :downloader="getDownloader(item)">
                    <template #trigger>
                      <div class="orange white--text status__tip">
                        {{ i18nLocal.t('status.downloading') }}
                        <v-icon
                          :class="{
                            'mr-1': true,
                            'kubegems__waiting-circle-flashing': true,
                          }"
                          color="white"
                          small
                        >
                          mdi-loading
                        </v-icon>
                      </div>
                    </template>
                  </JobStatusTip>
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-caption">
                From <strong>{{ item.source || 'default' }}</strong>
              </div>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>

      <div v-if="state.loading" class="my-3 py-2 text-center card__scroll__loading">
        <BaseDropProgress :progress="config.layout.PLATFORM" />
      </div>
    </div>

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

<script lang="ts" setup>
  import { convertResponse2Pagination } from '@kubegems/api/utils';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { PAI_DATASET_CATALOG_KEY, PAI_MODALSET_CATALOG_KEY } from '@kubegems/libs/constants/label';
  import _ from 'lodash';
  import { onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { Downloader, SetBase } from '../../../api/base';
  import { Dataset } from '../../../api/dataset';
  import { Modelset } from '../../../api/modelset';
  import { Region } from '../../../api/region';
  import { useI18n } from '../i18n';

  const props = withDefaults(
    defineProps<{
      region?: Region;
    }>(),
    {
      region: void 0,
    },
  );

  const store = useStore();
  const i18nLocal = useI18n();

  const state = reactive({
    loading: false,
  });

  const tab = ref(0);
  const tabItems = [
    { text: i18nLocal.t('tip.modelset'), value: 'modelset', icon: 'mdi:cube' },
    { text: i18nLocal.t('tip.dataset'), value: 'dataset', icon: 'mdi:database' },
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
            region: props.region.name,
          }).getPublicModelsetList({
            page: params.page,
            size: params.size,
            noprocessing: append || params.noprocessing,
            search: params.search || query.value.search || '',
            tenant: 'default',
            source: params.source || query.value.source || '',
          })
        : await new Dataset({
            region: props.region.name,
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

    pagination.items = pagination.items.slice();
    pagination.noprocessing = true;
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
      pagination.noprocessing = false;
      getPublicSetList();
    },
    {
      deep: true,
    },
  );

  onUnmounted(() => {
    if (_cancel) _cancel();
  });

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  watch(
    () => props.region,
    (newValue) => {
      if (newValue) {
        if (_cancel) _cancel();
        const { cancel } = useRequest(getPublicSetList, {
          pollingInterval: 1000 * 30,
          onSuccess: () => {
            pagination.noprocessing = true;
          },
        });
        _cancel = cancel;
      }
    },
    { deep: true, immediate: true },
  );

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

  const getStatus = (item: SetBase): string => {
    //completed
    const [download] = item.downloaders;
    if (download) {
      return download.message;
    }
    return 'unknown';
  };

  const getDownloader = (item: SetBase): Downloader => {
    const [download] = item.downloaders;
    return download || void 0;
  };

  const getIcon = (item: any): string => {
    if (tab.value === 0) {
      return item?.labels[PAI_MODALSET_CATALOG_KEY] || 'modelgeneric';
    } else {
      return item?.labels[PAI_DATASET_CATALOG_KEY] || 'mdi:database';
    }
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

    &__scroll {
      &__loading {
        position: relative;
        height: 70px;
      }
    }

    &__name {
      white-space: nowrap;
      overflow: auto;
      word-break: break-word;
      text-overflow: ellipsis;
      max-width: 100%;

      &__t {
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 85%;
        overflow: auto;
      }
    }
  }
</style>
