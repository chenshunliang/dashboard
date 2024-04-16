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
          <v-btn color="primary" small text @click="refresh">
            <v-icon small>mdi-refresh</v-icon>
            {{ i18n.t('operate.refresh') }}
          </v-btn>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card v-if="useQueueCheck()">
      <v-card-title class="py-4">
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.name'), value: 'search' }"
          :filters="filters"
          @loadData="loadFilterData"
        />
        <v-switch
          v-model="filterCreator"
          class="ml-3"
          hide-details
          :label="i18nLocal.t('tip.view_my')"
          @change="filterCreatorChanged"
        />
        <v-spacer />
        <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addInference">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ i18n.t('operate.create_c', [i18nLocal.t('resource.task')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="primary" text @click="bacthStopOrStartJobs(true)">
                  <v-icon left>mdi-play</v-icon>
                  {{ i18n.t('operate.batch_start_c', [i18nLocal.t('tip.task')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="warning" text @click="bacthStopOrStartJobs(false)">
                  <v-icon left>mdi-pause</v-icon>
                  {{ i18n.t('operate.batch_stop_c', [i18nLocal.t('tip.task')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" text @click="batchDeleteJobs">
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ i18n.t('operate.batch_delete_c', [i18nLocal.t('tip.task')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="name"
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
        show-select
        @item-selected="selected"
        @toggle-select-all="toggleSelectAll"
      >
        <template #item.name="{ item }">
          <div>
            <a class="text-subtitle-2" @click.stop="toInferenceDetail(item)">
              {{ item.displayName || item.name }}
            </a>
          </div>
          <v-menu
            v-if="item.description.length > 30"
            :close-delay="200"
            max-width="300"
            min-width="80"
            nudge-right="20px"
            nudge-top="-20px"
            open-on-hover
            top
          >
            <template #activator="{ on }">
              <div class="text-caption kubegems__text" v-on="on">
                {{ item.description ? `${item.description.substring(0, 30)}...` : '-' }}
              </div>
            </template>
            <v-card>
              <v-card-text class="pa-3 text-caption"> {{ item.description || '-' }} </v-card-text>
            </v-card>
          </v-menu>
          <div v-else class="text-caption kubegems__text"> {{ item.description || '-' }} </div>
        </template>
        <template #item.status="{ item, index }">
          <BaseStatus
            v-if="['Running', 'Paused', 'Completed'].indexOf(getStatus(item)) > -1"
            :bg-color="POD_STATUS_COLOR[getStatus(item)]"
            :status="getStatus(item) || 'Unknown'"
          />
          <TaskStatusTip
            v-else
            :job="item"
            :top="pagination.size - index <= 5 || (pagination.items.length <= 5 && index >= 1)"
          >
            <template #trigger>
              <BaseStatus
                :bg-color="POD_STATUS_COLOR[getStatus(item)]"
                :flashing="['Queued', 'Pending', 'InDelete'].indexOf(getStatus(item)) > -1"
                :status="getStatus(item) || 'Unknown'"
              />
              <div class="text-caption status pl-5">
                {{
                  item.status.message && item.status.message.length > 50
                    ? `${item.status.message.substr(0, 50)} ...`
                    : item.status.message || ''
                }}
              </div>
            </template>
          </TaskStatusTip>
        </template>
        <template #item.spec="{ item }">
          <div v-for="(role, index) in item.status.roles" :key="index">
            <div class="float-left">
              <BaseCollapseChips
                :chips="[getSku(role, index, item)]"
                :icon="role.name === 'master' ? 'mdi-alpha-m-circle' : 'mdi-alpha-w-circle'"
                single-line
              />
            </div>
            <div class="kubegems__clear-float" />
          </div>
        </template>
        <template #item.gpu="{ item }">
          <div v-for="(role, index) in item.config.roles" :key="index">
            <div class="float-left spec__chip">
              <BaseCollapseChips
                v-if="getGpu(role) !== '-'"
                :chips="[`${getGpu(role)} * ${role.replicas}`]"
                :icon="role.name === 'master' ? 'mdi-alpha-m-circle' : 'mdi-alpha-w-circle'"
                single-line
              />
              <span v-else>--</span>
            </div>
            <div class="kubegems__clear-float" />
          </div>
        </template>
        <template #item.address="{ item }">
          <div v-for="(port, index) in getAddresses(item)" :key="index" class="my-1">
            <BaseCollapseChips
              :chips="{ [port && port.access && port.access.host ? port.access.host : '']: port.port.toString() }"
              icon="mdi-alpha-p-circle"
              single-line
            >
              <template #action>
                <v-icon class="address__icon" color="white" small @click="toAddress(port)">mdi-open-in-new</v-icon>
              </template>
            </BaseCollapseChips>
          </div>
        </template>
        <template #item.updateAt="{ item }">
          {{ moment(item.updatedAt, 'YYYY-MM-DDTHH:mm:ssZ').format('lll') }}
        </template>
        <template #item.action="{ item, index }">
          <v-flex :id="`r-task${index}`" />
          <v-menu :attach="`#r-task${index}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="viewInference(item)">
                    {{ i18n.t('operate.view') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="updateInference(item)">
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex v-if="item.config.paused">
                  <v-btn color="primary" small text @click="startInference(item)">
                    {{ i18nLocal.t('operate.start') }}
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="warning" small text @click="stopInference(item)">
                    {{ i18nLocal.t('operate.stop') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeInference(item)">
                    {{ i18n.t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>

      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
      />
    </v-card>

    <BaseQueuePremission v-else />

    <InferenceFrom ref="task" @refresh="getInferenceList" />
    <ResourceYaml ref="yamlPanel" :item="yaml" />
  </v-container>
</template>

<script lang="ts" setup>
  import { Tenant } from '@kubegems/api/typed/tenant';
  import { convertResponse2List, convertResponse2Pagination } from '@kubegems/api/utils';
  import ResourceYaml from '@kubegems/components/logicComponents/ResourceYaml.vue';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import { convertStrToNum, deepCopy, sleep } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { Instance } from '../../api/instance';
  import { Job, Port, Role } from '../../api/job';
  import { usePreCheck, useQueueCheck } from '../../hooks/precheck';
  import TaskStatusTip from '../task/components/TaskStatusTip.vue';
  import InferenceFrom from './components/InferenceForm/index.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const router = useRouter();
  const store = useStore();
  const routeParams = useParams();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.spec'), value: 'spec', align: 'start' },
    { text: i18nLocal.t('table.gpu'), value: 'gpu', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'status', align: 'start' },
    { text: i18nLocal.t('table.address'), value: 'address', align: 'start' },
    { text: i18nLocal.t('table.creator'), value: 'creator', align: 'start' },
    { text: i18nLocal.t('table.update_at'), value: 'updateAt', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<Job> = reactive<Pagination<Job>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
    phase: '',
    creator: '',
    noprocessing: false,
  });

  const filterCreator = ref(false);
  const filterCreatorChanged = (): void => {
    getInferenceList({ page: 1, size: 10, noprocessing: false });
  };

  const getInferenceList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data = await new Job({
      region: store.getters.Region().RegionName,
      tenant: store.getters.Tenant().TenantName,
    }).getJobList({
      page: params.page,
      size: params.size,
      search: params.search || '',
      kind: 'inference',
      phase: params.phase || '',
      creator: filterCreator.value ? store.state.User.Username : params.creator || '',
      noprocessing: params.noprocessing,
    });
    pagination = Object.assign(pagination, convertResponse2Pagination(data));

    pagination.items = pagination.items.slice();
  };

  const filters = ref([
    { text: i18nLocal.t('filter.name'), value: 'search', items: [] },
    {
      text: i18nLocal.t('filter.status'),
      value: 'phase',
      items: [
        { text: 'Running', value: 'Running', parent: 'phase' },
        { text: 'Failed', value: 'Failed', parent: 'phase' },
        { text: 'Pending', value: 'Pending', parent: 'phase' },
        { text: 'Completed', value: 'Completed', parent: 'phase' },
      ],
    },
    { text: i18nLocal.t('filter.creator'), value: 'creator', items: [] },
  ]);
  const getTenantUser = async () => {
    const data = await new Tenant({ ID: store.getters.Tenant().ID }).getUserList({
      page: 1,
      size: 1000,
      noprocessing: true,
    });
    const userItems = convertResponse2List(data).map((u) => {
      return { text: u.Username, value: u.Username, parent: 'creator' };
    });
    filters.value[2].items = userItems;
  };
  const loadFilterData = () => {
    if (filters.value[2].items.length === 0) {
      getTenantUser();
    }
  };

  const query = useQuery();
  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.search) {
        pagination.search = newValue.value.search;
      } else {
        pagination.search = '';
      }
      if (newValue.value.phase) {
        pagination.phase = newValue.value.phase;
      } else {
        pagination.phase = '';
      }
      if (newValue.value.creator) {
        pagination.creator = newValue.value.creator;
      } else {
        pagination.creator = '';
      }
      if (!usePreCheck() || !useQueueCheck()) return;
      pagination = Object.assign(pagination, convertStrToNum(query.value));
      if (_cancel) _cancel();
      const { cancel } = useRequest(getInferenceList, {
        pollingInterval: 1000 * 30,
        onSuccess: () => {
          pagination.noprocessing = true;
        },
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

  const refresh = () => {
    if (!usePreCheck() || !useQueueCheck()) return;
    pagination.noprocessing = false;
    getInferenceList();
  };

  const pageChange = (page: number): void => {
    pagination.noprocessing = false;
    pagination.page = page;
    router.replace({
      query: { ...query.value, page: pagination.page.toString(), size: pagination.size.toString() },
    });
  };

  const sizeChange = (size: number): void => {
    pagination.noprocessing = false;
    pagination.page = 1;
    pagination.size = size;
    router.replace({
      query: { ...query.value, page: pagination.page.toString(), size: pagination.size.toString() },
    });
  };

  const toInferenceDetail = (item: Job): void => {
    router.push({
      name: 'pai-inference-detail',
      params: {
        name: item.name,
        ...routeParams.value,
      },
    });
  };

  const getAddresses = (item: Job): Port[] => {
    const [role] = item.status.roles || [];
    if (role) {
      return role.ports;
    }
    return [];
  };

  const toAddress = (item: any): void => {
    window.open(item?.access?.host || '');
  };

  const getGpu = (role: Role): string => {
    const sku = role.skuDetails?.resources?.find((res) => {
      return res.resourceName.indexOf('gpu') > -1;
    });
    if (sku)
      return sku?.resourceQuantity
        ? `${sku.name} ${sku.resourceQuantity} ${i18nLocal.t('tip.core')}`?.replaceAll('NVIDIA-', '')
        : '-';
    return '-';
  };

  const task = ref(null);
  const addInference = (): void => {
    task.value.open();
  };

  const updateInference = (item: Job): void => {
    task.value.init(item);
    task.value.open();
  };

  const stopInference = (item: Job): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.stop_c', [i18nLocal.t('resource.task')]),
      content: {
        text: `${i18nLocal.t('operate.stop_c', [i18nLocal.t('resource.task')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new Job(param.item).stopJob();
          getInferenceList();
        }
      },
    });
  };

  const startInference = (item: Job): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.start_c', [i18nLocal.t('resource.task')]),
      content: {
        text: `${i18nLocal.t('operate.start_c', [i18nLocal.t('resource.task')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new Job(param.item).startJob();
          getInferenceList();
        }
      },
    });
  };

  const removeInference = (item: Job): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('resource.task')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('resource.task')])} ${item.name}`,
        type: 'delete',
        name: item.name,
        warning: i18nLocal.t('tip.warn_text'),
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new Job(param.item).deleteJob();
          await sleep(500);
          getInferenceList();
        }
      },
    });
  };

  const selectedJobList = ref<Job[]>([]);
  const toggleSelectAll = (params: { items: Instance[]; value: boolean }): void => {
    if (params.value) {
      selectedJobList.value = deepCopy(params.items);
    } else {
      selectedJobList.value = [];
    }
  };
  const selected = (params: { item: Job; value: boolean }): void => {
    const index = selectedJobList.value.findIndex((u) => {
      return u.name === params.item.name;
    });
    if (params.value) {
      if (index === -1) selectedJobList.value.push(params.item);
    } else {
      if (index > -1) selectedJobList.value.splice(index, 1);
    }
  };

  const batchDeleteJobs = (): void => {
    if (selectedJobList.value.length === 0) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.batch_select_c', [i18nLocal.t('tip.job')]),
        color: 'warning',
      });
      return;
    }
    const resources: string[] = selectedJobList.value.map((c: Job) => c.name);
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.batch_delete_c', [i18nLocal.t('tip.job')]),
      content: {
        text: `${resources.join(',')}`,
        type: 'batch_delete',
        one: resources.length === 1 ? resources[0] : undefined,
        status: {},
        tip: `${i18n.t('operate.delete')}`,
      },
      param: {},
      doFunc: async (): Promise<void> => {
        for (const index in selectedJobList.value) {
          const model = selectedJobList.value[index];
          try {
            await new Job(model).deleteJob();
            store.commit('SET_CONFIRM_STATUS', {
              key: model.name,
              value: true,
            });
          } catch {
            store.commit('SET_CONFIRM_STATUS', {
              key: model.name,
              value: false,
            });
          }
        }
        getInferenceList();
      },
    });
  };

  const bacthStopOrStartJobs = (toStart = true): void => {
    const filteredJobList = selectedJobList.value.filter((j) => {
      return j.config.paused === toStart;
    });
    if (filteredJobList.length === 0) {
      if (toStart) {
        store.commit('SET_SNACKBAR', {
          text: i18nLocal.t('tip.batch_select_stop_c', [i18nLocal.t('resource.task')]),
          color: 'warning',
        });
        return;
      } else {
        store.commit('SET_SNACKBAR', {
          text: i18nLocal.t('tip.batch_select_start_c', [i18nLocal.t('resource.task')]),
          color: 'warning',
        });
        return;
      }
    }
    const resources: string[] = filteredJobList.map((j: Job) => j.name);
    store.commit('SET_CONFIRM', {
      title: toStart ? i18n.t('operate.batch_start') : i18n.t('operate.batch_stop'),
      content: {
        text: `${resources.join(',')}`,
        type: 'batch_delete',
        one: resources.length === 1 ? resources[0] : undefined,
        status: {},
        tip: toStart ? i18nLocal.t('operate.start') : i18nLocal.t('operate.stop'),
      },
      param: {},
      doFunc: async (): Promise<void> => {
        for (const index in filteredJobList) {
          const model = filteredJobList[index];
          try {
            if (toStart) await new Job(model).startJob();
            else await new Job(model).stopJob();
            store.commit('SET_CONFIRM_STATUS', {
              key: model.name,
              value: true,
            });
          } catch {
            store.commit('SET_CONFIRM_STATUS', {
              key: model.name,
              value: false,
            });
          }
        }
        getInferenceList();
      },
    });
  };

  const getStatus = (item: Job): string => {
    if (item.deletedAt) {
      return 'InDelete';
    }
    return item.status.state.phase;
  };

  const yaml = ref(null);
  const yamlPanel = ref(null);
  const viewInference = (item: Job): void => {
    yaml.value = item.raw;
    yamlPanel.value.open();
  };

  const getSku = (role: any, index: number, item: Job) => {
    const replicas = item?.config?.roles?.[index]?.replicas || 1;
    if (role?.resources?.limits) {
      return `${role?.resources?.limits?.cpu || ''}C${role?.resources?.limits?.memory || ''} * ${replicas}`.replaceAll(
        'i',
        '',
      );
    } else {
      return item?.config?.roles?.[index]?.sku;
    }
  };
</script>

<style lang="scss" scoped>
  .status {
    color: grey;
  }

  .address__icon {
    margin-top: -2px;
  }
</style>
