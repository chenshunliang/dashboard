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
  <BasePanel
    v-model="state.panel"
    icon="mdi-chart-areaspline-variant"
    :title="i18nLocal.t('tip.node_monitor')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-3 text-subtitle-2 white--text" />
    </template>
    <template #action>
      <v-flex class="float-right">
        <v-sheet class="text-body-1 text--darken-1 primary white--text">
          <BaseAggChartOperator v-model="operator" reverse />
          <BaseDatetimePicker v-model="date" color="primary" :default-value="30" @change="datetimeChanged" />
        </v-sheet>
      </v-flex>
    </template>
    <template #content>
      <v-card flat :style="{ overflow: 'auto', maxHeight: `calc((100vh - 64px) / ${store.state.Scale} - 1px)` }">
        <v-card-text :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`">
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
                :metrics="cpu"
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
                :metrics="memory"
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
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import { Matrix } from '@kubegems/api/typed/prometheus';
  import { useStore } from '@kubegems/extension/store';
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
  } from '@kubegems/libs/constants/prometheus';
  import { constructPromQLByOperator } from '@kubegems/libs/utils/prometheus';
  import moment from 'moment';
  import { onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { NodeSummary, Region } from '../../../api/region';
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      cluster: Region;
    }>(),
    {
      cluster: void 0,
    },
  );

  const state = reactive({
    panel: false,
  });

  const open = (): void => {
    state.panel = true;
  };

  const node = ref<NodeSummary>(new NodeSummary());
  const init = (item: NodeSummary): void => {
    node.value = item;
    datetimeChanged();
  };

  defineExpose({
    open,
    init,
  });

  const dispose = () => {
    node.value = new NodeSummary();
    state.panel = false;
  };

  const params = { start: '', end: '' };
  const date = ref([]);
  const datetimeChanged = (): void => {
    params.start = moment(date.value[0]).utc().format();
    params.end = moment(date.value[1]).utc().format();
    loadMetrics();
  };

  onUnmounted(() => {
    if (_cancel) _cancel();
  });

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  const loadMetrics = async (): Promise<void> => {
    if (_cancel) _cancel();
    const { cancel } = useRequest(loadData, {
      pollingInterval: 1000 * 30,
    });
    _cancel = cancel;
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

  const loadData = async (): Promise<void> => {
    params.start = moment(params.start).utc().add(30, 'seconds').format();
    params.end = moment(params.end).utc().add(30, 'seconds').format();
    nodeLoadRange();
    nodeCPUUsage();
    nodeMemoryUsage();
    nodeMemoryUsed();
    nodeDiskSize();
    nodeDiskIOPS();
    nodeNetworkUsage();
  };

  const getParams = (query: string, start: number, end: number): { [key: string]: any } => {
    query = constructPromQLByOperator(operator.value, query, params.start, params.end);
    let _params = Object.assign(params, { query: query, noprocessing: true });
    if (start && end) {
      _params = Object.assign(_params, { start: moment(start).utc().format(), end: moment(end).utc().format() });
    }
    return _params;
  };

  const load = ref([]);
  const nodeLoadRange = async (start = null, end = null): Promise<void> => {
    const data1 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_LOAD1_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data1?.length > 0) data1[0].metric['name'] = i18nLocal.t('tip.load_1').toString();
    const data2 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_LOAD5_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data2?.length > 0) data2[0].metric['name'] = i18nLocal.t('tip.load_5').toString();
    const data3 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_LOAD15_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data3?.length > 0) data3[0].metric['name'] = i18nLocal.t('tip.load_15').toString();
    let data = [];
    if (data1) data = data.concat(data1);
    if (data2) data = data.concat(data2);
    if (data3) data = data.concat(data3);
    load.value = data;
  };

  const memoryUsed = ref([]);
  const nodeMemoryUsed = async (start = null, end = null): Promise<void> => {
    const data1 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_MEMORY_TOTAL_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data1?.length > 0) data1[0].metric['name'] = i18nLocal.t('tip.total_memory').toString();
    const data2 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_MEMORY_USED_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data2?.length > 0) data2[0].metric['name'] = i18nLocal.t('tip.used_memory').toString();
    const data3 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_MEMORY_BUFFER_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data3?.length > 0) data3[0].metric['name'] = i18nLocal.t('tip.buffer_memory').toString();
    const data4 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_MEMORY_CACHED_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data4?.length > 0) data4[0].metric['name'] = i18nLocal.t('tip.cached_memory').toString();
    let data = [];
    if (data1) data = data.concat(data1);
    if (data2) data = data.concat(data2);
    if (data3) data = data.concat(data3);
    if (data4) data = data.concat(data4);
    memoryUsed.value = data;
  };

  const cpu = ref([]);
  const nodeCPUUsage = async (start = null, end = null): Promise<void> => {
    const data = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_CPU_USAGE_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data) cpu.value = data;
  };

  const memory = ref([]);
  const nodeMemoryUsage = async (start = null, end = null): Promise<void> => {
    const data = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_MEMORY_USAGE_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data) memory.value = data;
  };

  const network = ref([]);
  const nodeNetworkUsage = async (start = null, end = null): Promise<void> => {
    const data1 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_NETWORK_IN_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data1?.length > 0) data1[0].metric['name'] = i18nLocal.t('tip.in_traffic').toString();
    const data2 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_NETWORK_OUT_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data2?.length > 0) data2[0].metric['name'] = i18nLocal.t('tip.out_traffic').toString();
    let data = [];
    if (data1) data = data.concat(data1);
    if (data2) data = data.concat(data2);
    network.value = data;
  };

  const disk = ref([]);
  const nodeDiskSize = async (start = null, end = null): Promise<void> => {
    const data = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_DISK_AVAILABLE_SIZE_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data) disk.value = data;
  };

  const diskiops = ref([]);
  const nodeDiskIOPS = async (start = null, end = null): Promise<void> => {
    const data1 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_DISK_WRITE_IOPS_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data1?.length > 0) data1[0].metric['name'] = i18nLocal.t('tip.write_iops').toString();
    const data2 = await new Matrix().getMatrix(
      props.cluster?.clusterName,
      getParams(NODE_DISK_READ_IOPS_PROMQL.replaceAll('$1', node.value.name), start, end),
    );
    if (data2?.length > 0) data2[0].metric['name'] = i18nLocal.t('tip.read_iops').toString();
    let data = [];
    if (data1) data = data.concat(data1);
    if (data2) data = data.concat(data2);
    diskiops.value = data;
  };
</script>
