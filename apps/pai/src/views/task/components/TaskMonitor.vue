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
  <div>
    <v-card>
      <v-card-title class="py-4">
        <v-flex>
          <v-flex class="float-left">
            <v-sheet class="text-body-2 text--darken-1">
              <JobSelect v-model="pod" :pods="podItems" @change="jobChanged" />
            </v-sheet>
          </v-flex>
          <v-flex class="float-right">
            <v-sheet class="text-body-2 text--darken-1">
              <BaseAggChartOperator v-model="operator" />
              <BaseDatetimePicker v-model="date" :default-value="30" @change="datetimeChanged" />
            </v-sheet>
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-flex>
      </v-card-title>
      <v-card-text :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`">
        <v-row>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="pod"
              :metrics="cpu"
              :title="i18nLocal.t('tip.pod_cpu')"
              type="cpu"
              zoom
              @refresh="podCPUUsage"
            />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="pod"
              :metrics="memory"
              :title="i18nLocal.t('tip.pod_memory')"
              unit="MB"
              zoom
              @refresh="podMemoryUsage"
            />
          </v-col>
          <template v-if="hasGpu">
            <v-col cols="6">
              <BaseAreaChart
                :global-plugins-check="false"
                label="device"
                :metrics="gpu"
                :title="i18nLocal.t('tip.pod_gpu')"
                type="%"
                zoom
                @refresh="podGpuUsage"
              />
            </v-col>
            <v-col cols="6">
              <BaseAreaChart
                :global-plugins-check="false"
                label="device"
                :metrics="gpuMemory"
                :title="i18nLocal.t('tip.pod_gpu_memory')"
                type="%"
                zoom
                @refresh="podGpuMemoryUsage"
              />
            </v-col>
            <v-col cols="6">
              <BaseAreaChart
                :global-plugins-check="false"
                label="device"
                :metrics="gpuTemp"
                :title="i18nLocal.t('tip.gpu_temp')"
                unit="°C"
                zoom
                @refresh="podGpuTemp"
              />
            </v-col>
            <v-col cols="6">
              <BaseAreaChart
                :global-plugins-check="false"
                label="device"
                :metrics="gpuPower"
                :title="i18nLocal.t('tip.gpu_power')"
                unit="W"
                zoom
                @refresh="podGpuPower"
              />
            </v-col>
          </template>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="pod"
              :metrics="networkin"
              :title="i18nLocal.t('tip.traffic_in')"
              type="network"
              zoom
              @refresh="podNetworkIn"
            />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="pod"
              :metrics="networkout"
              :title="i18nLocal.t('tip.traffic_out')"
              type="network"
              zoom
              @refresh="podNetworkOut"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-3">
      <v-card-title class="py-1">
        <span class="text-subtitle-1 kubegems__text">{{ i18nLocal.t('tip.node_monitor') }}</span>
      </v-card-title>
      <v-card-text :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`">
        <div class="text-caption primary--text">
          {{ i18nLocal.t('tip.node') }} : {{ pod ? pod.spec.nodeName : '' }}
        </div>
        <v-row>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="name"
              :metrics="load"
              :title="i18nLocal.t('tip.load')"
              type=""
              zoom
              @refresh="nodeLoadRange"
            />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="node"
              :metrics="nodeCpu"
              :title="i18nLocal.t('tip.cpu_rate')"
              type="%"
              zoom
              @refresh="nodeCPUUsage"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="node"
              :metrics="nodeMemory"
              :title="i18nLocal.t('tip.memory_rate')"
              type="%"
              zoom
              @refresh="nodeMemoryUsage"
            />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="name"
              :metrics="memoryUsed"
              :title="i18nLocal.t('tip.memory_used_status')"
              type="memory"
              zoom
              @refresh="nodeMemoryUsed"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="device"
              :metrics="disk"
              :title="i18nLocal.t('tip.remain_storage')"
              type="storage"
              zoom
              @refresh="nodeDiskSize"
            />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="name"
              :metrics="diskiops"
              :title="i18nLocal.t('tip.disk_iops')"
              type=""
              zoom
              @refresh="nodeDiskIOPS"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <BaseAreaChart
              :global-plugins-check="false"
              label="name"
              :metrics="network"
              :title="i18nLocal.t('tip.network')"
              type="network"
              zoom
              @refresh="nodeNetworkUsage"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
  import { Pod } from '@kubegems/api/typed/pod';
  import { Matrix } from '@kubegems/api/typed/prometheus';
  import { useStore } from '@kubegems/extension/store';
  import { SERVICE_PAI } from '@kubegems/libs/constants/namespace';
  import {
    NODE_CPU_USAGE_PROMQL,
    NODE_DISK_AVAILABLE_SIZE_PROMQL,
    NODE_DISK_READ_IOPS_PROMQL,
    NODE_DISK_WRITE_IOPS_PROMQL,
    NODE_LOAD15_PROMQL,
    NODE_LOAD1_PROMQL,
    NODE_LOAD5_PROMQL,
    NODE_MEMORY_BUFFER_PROMQL,
    NODE_MEMORY_CACHED_PROMQL,
    NODE_MEMORY_TOTAL_PROMQL,
    NODE_MEMORY_USAGE_PROMQL,
    NODE_MEMORY_USED_PROMQL,
    NODE_NETWORK_IN_PROMQL,
    NODE_NETWORK_OUT_PROMQL,
    NVIDIA_GPU_PROMQL,
    NVIDIA_POWER_PROMQL,
    NVIDIA_TEMP_PROMQL,
    PAI_JOB_NVIDIA_GPU_MEMORY_BY_POD_PROMQL,
    POD_CPU_USAGE_PROMQL,
    POD_MEMORY_USAGE_PROMQL,
    POD_NETWORK_IN_PROMQL,
    POD_NETWORK_OUT_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { constructPromQLByOperator } from '@kubegems/libs/utils/prometheus';
  import moment from 'moment';
  import { ComputedRef, computed, onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { Job } from '../../../api/job';
  import { useI18n } from '../i18n';
  import JobSelect from './JobSelect.vue';

  const props = withDefaults(
    defineProps<{
      job?: Job;
    }>(),
    {
      job: void 0,
    },
  );

  const hasGpu: ComputedRef<boolean> = computed(() => {
    return props.job?.config?.roles?.some((role) => {
      return role.skuDetails?.resources?.some((r) => {
        return r.resourceName?.indexOf('nvidia.com/gpu') > -1;
      });
    });
  });

  const store = useStore();
  const i18nLocal = useI18n();

  const params = reactive({
    start: void 0,
    end: void 0,
  });

  const pod = ref<Pod>(void 0);
  const podItems = ref<Pod[]>([]);
  const getPodList = async (): Promise<void> => {
    podItems.value = await new Job(props.job).getPodListInJob();
    if (podItems.value?.length === 0) {
      props.job.config.roles.forEach((r) => {
        podItems.value.push(
          new Pod({
            metadata: {
              name: `${store.getters.Tenant().TenantName}-${props.job.name}-${r.name}-0`,
              namespace: SERVICE_PAI,
            },
            spec: {
              nodeName: '',
            },
          }),
        );
      });
    }
    pod.value = podItems.value?.[0];
  };

  watch(
    () => props.job,
    (newValue) => {
      if (newValue && newValue.name) {
        getPodList();
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  onUnmounted(() => {
    if (_cancel) _cancel();
  });

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  const jobChanged = async (): Promise<void> => {
    params.start = moment(date.value[0]).utc().format();
    params.end = moment(date.value[1]).utc().format();
    if (_cancel) _cancel();
    const { cancel } = useRequest(loadData, {
      pollingInterval: 1000 * 30,
    });
    _cancel = cancel;
  };

  const loadData = async (): Promise<void> => {
    params.start = moment(params.start).utc().add(30, 'seconds').format();
    params.end = moment(params.end).utc().add(30, 'seconds').format();
    podCPUUsage();
    podMemoryUsage();
    podNetworkIn();
    podNetworkOut();
    podGpuUsage();
    podGpuMemoryUsage();
    podGpuTemp();
    podGpuPower();

    nodeLoadRange();
    nodeCPUUsage();
    nodeMemoryUsage();
    nodeMemoryUsed();
    nodeDiskSize();
    nodeDiskIOPS();
    nodeNetworkUsage();
  };

  const operator = ref('default');
  watch(
    () => operator.value,
    () => {
      loadData();
    },
    {
      deep: true,
    },
  );

  const getParams = (query: string, start: number, end: number): { [key: string]: any } => {
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    let _params = Object.assign(params, { query: query, noprocessing: true });
    if (start && end) {
      _params = Object.assign(_params, { start: moment(start).utc().format(), end: moment(end).utc().format() });
    }
    return _params;
  };

  const cpu = ref<Matrix[]>([]);
  const podCPUUsage = async (start = null, end = null): Promise<void> => {
    let query = POD_CPU_USAGE_PROMQL.replaceAll('$1', pod?.value?.metadata?.name).replaceAll(
      '$2',
      pod?.value?.metadata?.namespace,
    );
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) cpu.value = data;
  };

  const memory = ref<Matrix[]>([]);
  const podMemoryUsage = async (start = null, end = null): Promise<void> => {
    let query = POD_MEMORY_USAGE_PROMQL.replaceAll('$1', pod?.value?.metadata?.name).replaceAll(
      '$2',
      pod?.value?.metadata?.namespace,
    );
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) memory.value = data;
  };

  const networkin = ref<Matrix[]>([]);
  const podNetworkIn = async (start = null, end = null): Promise<void> => {
    let query = POD_NETWORK_IN_PROMQL.replaceAll('$1', pod?.value?.metadata?.name).replaceAll(
      '$2',
      pod?.value?.metadata?.namespace,
    );
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) networkin.value = data;
  };

  const networkout = ref<Matrix[]>([]);
  const podNetworkOut = async (start = null, end = null): Promise<void> => {
    let query = POD_NETWORK_OUT_PROMQL.replaceAll('$1', pod?.value?.metadata?.name).replaceAll(
      '$2',
      pod?.value?.metadata?.namespace,
    );
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) networkout.value = data;
  };

  const gpu = ref<Matrix[]>([]);
  const podGpuUsage = async (start = null, end = null): Promise<void> => {
    let query = NVIDIA_GPU_PROMQL.replaceAll('$1', pod?.value?.metadata?.name);
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) gpu.value = data;
  };

  const gpuMemory = ref<Matrix[]>([]);
  const podGpuMemoryUsage = async (start = null, end = null): Promise<void> => {
    let query = PAI_JOB_NVIDIA_GPU_MEMORY_BY_POD_PROMQL.replaceAll('$1', pod?.value?.metadata?.name);
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) gpuMemory.value = data;
  };

  const gpuTemp = ref<Matrix[]>([]);
  const podGpuTemp = async (start = null, end = null): Promise<void> => {
    let query = NVIDIA_TEMP_PROMQL.replaceAll('$1', pod?.value?.metadata?.name);
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) gpuTemp.value = data;
  };

  const gpuPower = ref<Matrix[]>([]);
  const podGpuPower = async (start = null, end = null): Promise<void> => {
    let query = NVIDIA_POWER_PROMQL.replaceAll('$1', pod?.value?.metadata?.name);
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    let _params = Object.assign(params, { query: query, noprocessing: true });
    if (start && end) {
      _params = Object.assign(_params, { start: moment(start).utc().format(), end: moment(end).utc().format() });
    }
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, _params);
    if (data) gpuPower.value = data;
  };

  const memoryUsed = ref([]);
  const nodeMemoryUsed = async (start = null, end = null) => {
    const data1 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_MEMORY_TOTAL_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data1?.length > 0) data1[0].metric['name'] = i18nLocal.t('tip.total_memory').toString();
    const data2 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_MEMORY_USED_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data2?.length > 0) data2[0].metric['name'] = i18nLocal.t('tip.used_memory').toString();
    const data3 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_MEMORY_BUFFER_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data3?.length > 0) data3[0].metric['name'] = i18nLocal.t('tip.buffer_memory').toString();
    const data4 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_MEMORY_CACHED_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data4?.length > 0) data4[0].metric['name'] = i18nLocal.t('tip.cached_memory').toString();
    let data = [];
    if (data1) data = data.concat(data1);
    if (data2) data = data.concat(data2);
    if (data3) data = data.concat(data3);
    if (data4) data = data.concat(data4);
    memoryUsed.value = data;
  };

  const load = ref([]);
  const nodeLoadRange = async (start = null, end = null) => {
    const data1 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_LOAD1_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data1?.length > 0) data1[0].metric['name'] = i18nLocal.t('tip.load_1').toString();
    const data2 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_LOAD5_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data2?.length > 0) data2[0].metric['name'] = i18nLocal.t('tip.load_5').toString();
    const data3 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_LOAD15_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data3?.length > 0) data3[0].metric['name'] = i18nLocal.t('tip.load_15').toString();
    let data = [];
    if (data1) data = data.concat(data1);
    if (data2) data = data.concat(data2);
    if (data3) data = data.concat(data3);
    load.value = data;
  };

  const nodeCpu = ref([]);
  const nodeCPUUsage = async (start = null, end = null) => {
    let query = NODE_CPU_USAGE_PROMQL.replaceAll('$1', pod.value.spec.nodeName);
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) nodeCpu.value = data;
  };

  const nodeMemory = ref([]);
  const nodeMemoryUsage = async (start = null, end = null) => {
    let query = NODE_MEMORY_USAGE_PROMQL.replaceAll('$1', pod.value.spec.nodeName);
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) nodeMemory.value = data;
  };

  const network = ref([]);
  const nodeNetworkUsage = async (start = null, end = null) => {
    const data1 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_NETWORK_IN_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data1?.length > 0) data1[0].metric['name'] = i18nLocal.t('tip.in_traffic').toString();
    const data2 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_NETWORK_OUT_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data2?.length > 0) data2[0].metric['name'] = i18nLocal.t('tip.out_traffic').toString();
    let data = [];
    if (data1) data = data.concat(data1);
    if (data2) data = data.concat(data2);
    network.value = data;
  };

  const disk = ref([]);
  const nodeDiskSize = async (start = null, end = null) => {
    let query = NODE_DISK_AVAILABLE_SIZE_PROMQL.replaceAll('$1', pod.value.spec.nodeName);
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    const data = await new Matrix().getMatrix(store.getters.Region().ClusterName, getParams(query, start, end));
    if (data) disk.value = data;
  };

  const diskiops = ref([]);
  const nodeDiskIOPS = async (start = null, end = null) => {
    const data1 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_DISK_WRITE_IOPS_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data1?.length > 0) data1[0].metric['name'] = i18nLocal.t('tip.write_iops').toString();
    const data2 = await new Matrix().getMatrix(
      store.getters.Region().ClusterName,
      getParams(NODE_DISK_READ_IOPS_PROMQL.replaceAll('$1', pod.value.spec.nodeName), start, end),
    );
    if (data2?.length > 0) data2[0].metric['name'] = i18nLocal.t('tip.read_iops').toString();
    let data = [];
    if (data1) data = data.concat(data1);
    if (data2) data = data.concat(data2);
    diskiops.value = data;
  };

  const date = ref([]);
  const datetimeChanged = () => {
    if (date.value?.length === 2) {
      params.start = moment(date.value[0]).utc().format();
      params.end = moment(date.value[1]).utc().format();
      loadData();
    }
  };
</script>
