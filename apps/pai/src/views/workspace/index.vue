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
    <BaseBreadcrumb />

    <template v-if="useQueueCheck()">
      <v-card>
        <v-card-title class="py-4">
          <BaseFilter1 :default="{ items: [], text: i18nLocal.t('filter.name'), value: 'search' }" :filters="filters" />
          <v-switch
            v-model="filterCreator"
            class="ml-3"
            hide-details
            :label="i18nLocal.t('tip.view_my')"
            @change="filterCreatorChanged"
          />
        </v-card-title>
      </v-card>

      <div
        id="workspace__set"
        class="card"
        :style="{ height: `calc((100vh - 268px) / ${store.state.Scale})`, overflowY: 'auto', overflowX: 'hidden' }"
      >
        <v-row v-scroll:#workspace__set="_.debounce(scrolled, 50)" class="mt-3">
          <v-col v-for="(item, index) in pagination.items" :key="index" class="pt-0" cols="3">
            <v-hover #default="{ hover }">
              <v-card class="mx-auto pa-3" :elevation="hover ? 5 : 0" flat height="100%">
                <v-menu left>
                  <template #activator="{ on }">
                    <v-btn class="float-right" icon>
                      <v-icon color="primary" small v-on="on"> mdi-cog </v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-text class="pa-2">
                      <v-flex>
                        <v-btn color="primary" small text @click="editWorkspaceset(item)">
                          {{ i18n.t('operate.edit') }}
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-btn color="error" small text @click="removeWorkspaceset(item)">
                          {{ i18n.t('operate.delete') }}
                        </v-btn>
                      </v-flex>
                    </v-card-text>
                  </v-card>
                </v-menu>
                <div class="text-h6 primary--text">
                  {{ item.displayName || item.name }}
                </div>
                <div class="mb-2 text-caption">
                  {{ moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') }} By {{ item.creator }}
                </div>
                <v-divider />
                <v-list-item class="px-0" three-line>
                  <v-list-item-avatar class="primary--text mb-0" size="80" tile>
                    <BaseLogo icon-name="mdi:folder-file" :width="70" />
                  </v-list-item-avatar>
                  <v-list-item-content class="card__content">
                    {{ item.description }}
                  </v-list-item-content>
                </v-list-item>

                <v-card-actions class="px-0">
                  <v-menu :close-delay="200" max-width="350" min-width="80" open-on-hover right top>
                    <template #activator="{ on }">
                      <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc card__desc__wd" v-on="on">
                        <v-icon color="orange" small>mdi-chart-donut</v-icon>
                        Size: {{ item.status.size || 0 }}
                        <span class="mx-2" />
                      </v-list-item-subtitle>
                      <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc card__desc__wd" v-on="on">
                        <v-icon color="orange" small>mdi-bucket</v-icon>
                        Objects: {{ item.status.count || 0 }}
                        <span class="mx-2" />
                      </v-list-item-subtitle>
                    </template>
                    <v-card>
                      <v-card-text class="pa-3 text-body-2">
                        {{ i18n.t('used') }}: {{ item.status.size }} /
                        {{ item.config && item.config.capacity ? item.config.capacity : 0 }} ({{
                          item.status.progress ? item.status.progress.toFixed(2) : 0
                        }}%)
                      </v-card-text>
                    </v-card>
                  </v-menu>
                  <v-spacer />
                  <v-spacer />
                  <v-spacer />
                  <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc text-end">
                    <v-btn class="px-1" color="primary" small text @click="viewSet(item)">
                      {{ i18nLocal.t('operate.view_c', [i18nLocal.t('resource.workspace')]) }}
                    </v-btn>
                  </v-list-item-subtitle>
                </v-card-actions>

                <v-progress-linear
                  class="card__linear kubegems__pointer"
                  :color="item.status.color"
                  height="3"
                  :value="item.status.progress"
                />
              </v-card>
            </v-hover>
          </v-col>
          <v-col class="pt-0" cols="3">
            <v-hover #default="{ hover }">
              <v-card
                class="kubegems__full-height kubegems__pointer"
                :elevation="hover ? 5 : 0"
                flat
                min-height="196"
                @click="createWorkspaceset"
              >
                <v-card-text class="pa-0 kubegems__full-height">
                  <v-list-item class="kubegems__full-height" three-line>
                    <v-list-item-content>
                      <div block class="text-h6 primary--text text-center">
                        <v-icon class="mt-n1" color="primary">mdi-plus-box</v-icon>
                        {{ i18n.t('operate.add_c', [i18nLocal.t('resource.workspace')]) }}
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
          @click="createWorkspaceset"
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

    <WorkspaceForm ref="workspaceset" @refresh="getWorkspacesetList({ page: 1, size: 20 })" />
    <ViewSet ref="viewer" />
  </v-container>
</template>

<script lang="ts" setup>
  import { convertResponse2Pagination } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { beautifyFloatNum, beautifyStorageUnit, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import _ from 'lodash';
  import moment from 'moment';
  import { reactive, ref, watch } from 'vue';

  import { SetBase } from '../../api/base';
  import { Workspace } from '../../api/workspace';
  import { usePreCheck, useQueueCheck } from '../../hooks/precheck';
  import ViewSet from '../components/ViewSet.vue';
  import WorkspaceForm from './components/WorkspaceForm.vue';
  import { useI18n } from './i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  let pagination: Pagination<Workspace> = reactive<Pagination<Workspace>>({
    page: 1,
    size: 20,
    pageCount: 0,
    items: [],
    search: '',
  });

  const filterCreator = ref(false);
  const filterCreatorChanged = (): void => {
    getWorkspacesetList({ page: 1, size: 20 });
  };

  const getWorkspacesetList = async (params: KubePaginationRequest = pagination, append = false): Promise<void> => {
    const data = await new Workspace({
      region: store.getters.Region().RegionName,
      tenant: store.getters.Tenant().TenantName,
    }).getWorkspaceList({
      page: params.page,
      size: params.size,
      noprocessing: append,
      creator: filterCreator.value ? store.state.User.Username : '',
      search: params.search || '',
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
    });
    pagination.items = pagination.items.slice();
  };

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
      getWorkspacesetList();
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const workspaceset = ref<any>(null);
  const createWorkspaceset = (): void => {
    workspaceset.value.open();
  };

  const editWorkspaceset = (item: Workspace): void => {
    workspaceset.value.init(item);
    workspaceset.value.open();
  };

  const removeWorkspaceset = (item: Workspace): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('resource.workspace')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('resource.workspace')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new Workspace(param.item).deleteWorkspace();
          getWorkspacesetList();
        }
      },
    });
  };

  const offsetTop = ref<number>(0);
  const state = reactive({
    loading: false,
  });
  const scrolled = async (e): Promise<void> => {
    offsetTop.value = e.target.scrollTop;
    if (e.target.scrollTop + document.getElementById('workspace__set').clientHeight >= e.target.scrollHeight - 10) {
      if (pagination.pageCount <= pagination.page) return;
      pagination.page += 1;
      state.loading = true;
      await getWorkspacesetList(pagination, true);
      state.loading = false;
    }
  };

  const goToTop = () => {
    const container = document.getElementById('workspace__set');
    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const viewer = ref(null);
  const viewSet = (item: Workspace): void => {
    viewer.value.open();
    viewer.value.init(item, `${i18nLocal.t('resource.workspace')} ${item.name}`);
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
    }

    &__content {
      max-height: 82px;
      overflow: auto;
      white-space: normal;
      word-break: break-word;
      font-size: 15px;
      color: rgba(0, 0, 0, 0.6);
      line-height: 22px;
    }
  }
</style>
