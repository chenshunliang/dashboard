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
    <BaseRegionHeader v-if="!store.state.AdminViewport" />

    <BaseBreadcrumb>
      <template v-if="store.state.AdminViewport" #extend>
        <v-flex class="kubegems__full-right">
          <RegionSelect v-model="region" />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter1 :default="{ items: [], text: i18nLocal.t('filter.name'), value: 'search' }" :filters="filters" />
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.startAt="{ item }">
          {{ moment(item.startTimestamp).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template #item.status="{ item }">
          <BaseStatus
            :bg-color="getColor(item)"
            :flashing="['Succeeded', 'Stopped', 'Paused'].indexOf(item.phase) === -1"
            :status="item.phase || 'Unknown'"
          />
          <div v-if="item.phase !== 'Succeeded'" class="text-caption status pl-5">
            {{ item.message }}
          </div>
        </template>
        <template #item.name="{ item }">
          {{ item.storageSetName }}
          <v-btn
            v-if="item.phase !== 'Succeeded' && item.phase !== 'Stopped'"
            color="primary"
            icon
            small
            @click="openContainerLog(item)"
          >
            <v-icon color="primary" small>mdi-file-document</v-icon>
          </v-btn>
        </template>
        <template #item.duration="{ item }">
          {{ getDurationTime(item) }}
        </template>
        <template #item.action="{ item, index }">
          <v-flex :id="`r-asynctask${index}`" />
          <v-menu :attach="`#r-asynctask${index}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click="updateAsyncTask(item)">
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>

                <v-flex v-if="item.phase === 'Stopped' || item.phase === 'Paused'">
                  <v-btn color="primary" small text @click="startAsyncTask(item)">
                    {{ i18n.t('operate.start') }}
                  </v-btn>
                </v-flex>
                <v-flex v-else-if="item.phase === 'Succeeded'">
                  <v-btn color="primary" small text @click="restartAsyncTask(item)">
                    {{ i18n.t('operate.restart') }}
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="warning" small text @click="stopAsyncTask(item)">
                    {{ i18n.t('operate.stop') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeAsyncTask(item)">
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

    <AsyncTaskForm ref="asyncTaskForm" :region="region" @refresh="getAsyncTaskList" />
    <ContainerLog ref="containerLog" :config="config" />
  </v-container>
</template>

<script lang="ts" setup>
  import { Pod } from '@kubegems/api/typed/pod';
  import { convertResponse2Pagination } from '@kubegems/api/utils';
  import ContainerLog from '@kubegems/components/logicComponents/ContainerLog.vue';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useMeta, useParams, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { SERVICE_PAI } from '@kubegems/libs/constants/namespace';
  import { convertStrToNum, formatDuring } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { computed, onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { Region } from '../../api/region';
  import { AsyncTask } from '../../api/task';
  import { usePreCheck } from '../../hooks/precheck';
  import RegionSelect from '../components/RegionSelect.vue';
  import AsyncTaskForm from './components/AsyncTaskForm.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();

  const isAdmin = computed(() => {
    return (useMeta() as any)?.admin;
  });

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.kind'), value: 'kind', align: 'start' },
    { text: i18nLocal.t('table.storage_kind'), value: 'storageSetKind', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'status', align: 'start' },
    { text: i18nLocal.t('table.creator'), value: 'creator', align: 'start' },
    { text: i18nLocal.t('table.start_at'), value: 'startAt', align: 'start' },
    { text: i18nLocal.t('table.duration'), value: 'duration', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<AsyncTask> = reactive<Pagination<AsyncTask>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
    noprocessing: false,
    'storageset-kinds': '',
    'exclude-kinds': '',
  });
  const query = useQuery();
  const getAsyncTaskList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const requestParams = {
      page: params.page,
      size: params.size,
      noprocessing: params.noprocessing,
      search: params.search || query.value.search || '',
      'storageset-kinds': params['storageset-kinds'] || query.value['storageset-kinds'] || '',
      'exclude-kinds': params['exclude-kinds'] || query.value['exclude-kinds'] || '',
    };

    const data = isAdmin
      ? await new AsyncTask({
          region: region.value.name,
        }).getAdminTaskList(requestParams)
      : await new AsyncTask({
          region: region.value.name,
          tenant: store.getters.Tenant().TenantName,
        }).getTaskList(requestParams);

    pagination = Object.assign(pagination, convertResponse2Pagination(data));
  };

  const filters = [
    { text: i18nLocal.t('filter.name'), value: 'search', items: [] },
    {
      text: i18nLocal.t('filter.storage_kind'),
      value: 'storageset-kinds',
      items: [
        { text: i18nLocal.t('resource.modelset'), value: 'modelset', parent: 'storageset-kinds' },
        { text: i18nLocal.t('resource.dataset'), value: 'dataset', parent: 'storageset-kinds' },
      ],
    },
    {
      text: i18nLocal.t('filter.kind'),
      value: 'exclude-kinds',
      items: [
        { text: i18nLocal.t('exclude.default'), value: 'Default', parent: 'exclude-kinds' },
        { text: i18nLocal.t('exclude.modelx'), value: 'ModelX', parent: 'exclude-kinds' },
        { text: i18nLocal.t('exclude.huggingface'), value: 'HuggingFace', parent: 'exclude-kinds' },
      ],
    },
  ];

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  const region = ref(void 0);
  watch(
    () => region.value,
    (newValue) => {
      if (newValue) {
        if (!usePreCheck()) return;
        pagination = Object.assign(pagination, convertStrToNum(query.value));
        if (_cancel) _cancel();
        const { cancel } = useRequest(getAsyncTaskList, {
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
  onUnmounted(() => {
    if (_cancel) _cancel();
  });

  const routeParams = useParams();
  watch(
    () => routeParams.value,
    (newValue) => {
      region.value = new Region({
        name: newValue?.region || store.getters.Region().RegionName,
        clusterName: store.getters.Region().ClusterName,
      });
    },
    { deep: true, immediate: true },
  );

  const pageChange = (page: number): void => {
    pagination.page = page;
    router.replace({
      query: { ...query.value, page: pagination.page.toString(), size: pagination.size.toString() },
    });
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
    router.replace({
      query: { ...query.value, page: pagination.page.toString(), size: pagination.size.toString() },
    });
  };

  const getColor = (item: AsyncTask) => {
    switch (item.phase) {
      case 'Succeeded':
        return 'var(--grey-color)';
      case 'Stopped':
      case 'Paused':
        return 'var(--grey-color)';
      default:
        return 'var(--warning-color)';
    }
  };

  const getDurationTime = (item: AsyncTask): string => {
    if (item.phase === 'Succeeded') {
      const s = new Date(item.startTimestamp);
      const e = new Date(item.completionTimestamp);
      return formatDuring((e as any) - (s as any));
    }
    return '--';
  };

  const stopAsyncTask = (item: AsyncTask): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.stop_c', [i18nLocal.t('resource.async_task')]),
      content: {
        text: `${i18n.t('operate.stop_c', [i18nLocal.t('resource.async_task')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          isAdmin
            ? await new AsyncTask({ ...param.item, region: region.value.name }).controlAdminTask('stop')
            : await new AsyncTask({ ...param.item, region: region.value.name }).controlTask('stop');
          getAsyncTaskList();
        }
      },
    });
  };

  const restartAsyncTask = (item: AsyncTask): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.restart_c', [i18nLocal.t('resource.async_task')]),
      content: {
        text: `${i18n.t('operate.restart_c', [i18nLocal.t('resource.async_task')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          isAdmin
            ? await new AsyncTask({ ...param.item, region: region.value.name }).controlAdminTask('restart')
            : await new AsyncTask({ ...param.item, region: region.value.name }).controlTask('restart');
          getAsyncTaskList();
        }
      },
    });
  };

  const startAsyncTask = (item: AsyncTask): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.start_c', [i18nLocal.t('resource.async_task')]),
      content: {
        text: `${i18n.t('operate.start_c', [i18nLocal.t('resource.async_task')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          isAdmin
            ? await new AsyncTask({ ...param.item, region: region.value.name }).controlAdminTask('start')
            : await new AsyncTask({ ...param.item, region: region.value.name }).controlTask('start');
          getAsyncTaskList();
        }
      },
    });
  };

  const removeAsyncTask = (item: AsyncTask): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('resource.async_task')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('resource.async_task')])} ${item.storageSetName}`,
        type: 'delete',
        name: item.storageSetName,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          isAdmin
            ? await new AsyncTask({ ...param.item, region: region.value.name }).removeAdminTask()
            : await new AsyncTask({ ...param.item, region: region.value.name }).removeTask();
          getAsyncTaskList();
        }
      },
    });
  };

  const asyncTaskForm = ref(null);
  const updateAsyncTask = (item: AsyncTask): void => {
    asyncTaskForm.value.init(item);
    asyncTaskForm.value.open();
  };

  const containerLog = ref(null);
  const openContainerLog = async (item: AsyncTask) => {
    const pod = await new Pod({ metadata: { name: item.podName, namespace: SERVICE_PAI } }).getPod(
      region.value.clusterName,
      { noprocessing: true },
    );

    const container = pod.spec.containers?.length > 0 ? pod.spec.containers[0].name : '';
    const _item = {
      namespace: pod.metadata.namespace,
      name: pod.metadata.name,
      containers: pod.status.containerStatuses?.concat(
        pod.spec.initContainers
          ? pod.spec.initContainers.map((i) => {
              return { ...i, showName: `${i.name} (init)` } as any;
            })
          : [],
      ),
    };
    containerLog.value.init(container, _item, false, true);
    containerLog.value.open();
  };
</script>
