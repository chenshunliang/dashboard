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
    <BaseRegionHeader :selectable="false" />

    <ResourceViewer :region="region" />

    <v-card class="mt-3">
      <v-card-title class="py-4">
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.name'), value: 'search' }"
          :filters="filters"
          :reload="false"
          @filter="customFilter"
        />
        <v-spacer />
        <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2 text-center">
              <v-flex>
                <v-btn color="primary" text @click="batchSetRole">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ i18nLocal.t('operate.batch_label_compute') }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4 pb-4 kubegems__table-row-pointer"
        :headers="headers"
        hide-default-footer
        item-key="name"
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
        show-expand
        show-select
        single-expand
        :sort-by="['gpuMode']"
        @click:row="onRowClick"
        @item-selected="selected"
        @toggle-select-all="toggleSelectAll"
        @update:expanded="onExpanded"
      >
        <template #item.status="{ item }">
          <v-avatar
            class="mr-2"
            size="10"
            :style="`background-color: ${
              item.usage.phase === 'Ready'
                ? config.theme.THEME_COLOR.success
                : item.usage.phase === 'Unknown'
                ? config.theme.THEME_COLOR_EXTEND.grey
                : config.theme.THEME_COLOR_EXTEND.error
            };`"
          >
            <span class="white--text text-h5" />
          </v-avatar>
          {{ item.usage.phase }}
        </template>
        <template #item.cpuMode="{ item }">
          <BaseCollapseChips :chips="item.resources.cpu ? [item.cpuMode] : []" icon="mdi-cpu-64-bit" single-line />
        </template>
        <template #item.gpuMode="{ item }">
          <BaseCollapseChips
            :chips="item.resources['nvidia.com/gpu'] ? [item.gpuMode] : []"
            icon="mdi-expansion-card"
            single-line
          />
        </template>
        <template #item.gpuUsed="{ item }">
          <template v-if="item.gpu || (item.labels && item.labels['nvidia.com/gpu.product'])">
            {{ item.gpu }} / {{ item.gpuTotal }}
            <v-progress-linear
              class="rounded font-weight-medium"
              :color="getColor(item.gpuPercentage)"
              height="15"
              :value="item.gpuPercentage"
            >
              <span class="white--text"> {{ item.gpuPercentage }}% </span>
            </v-progress-linear>
          </template>
          <template v-else>-</template>
        </template>
        <template #item.cpuUsed="{ item }">
          {{ item.cpu }} / {{ item.cpuTotal }}
          <v-progress-linear
            class="rounded font-weight-medium"
            :color="getColor(item.cpuPercentage)"
            height="15"
            :value="item.cpuPercentage"
          >
            <span class="white--text"> {{ item.cpuPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #item.memoryUsed="{ item }">
          {{ item.memory }}
          Gi / {{ sizeOfStorage(item.resources.memory ? item.resources.memory.total : '-').toFixed(1) }}
          Gi
          <v-progress-linear
            class="rounded font-weight-medium"
            :color="getColor(item.memoryPercentage)"
            height="15"
            :value="item.memoryPercentage"
          >
            <span class="white--text"> {{ item.memoryPercentage }}% </span>
          </v-progress-linear>
        </template>
        <template #item.load="{ item }">
          <v-sheet :class="`text-subtitle-2 ${getLoadColor(item)} rounded text-center py-2 kubegems__text px-2`">
            {{ item.load ? item.load : 0 }}
          </v-sheet>
        </template>
        <template #item.cuda="{ item }">
          {{ item.usage.nvidiaCudaVersion }}
        </template>
        <template #item.driver="{ item }">
          {{ item.usage.nvidiaDriverVersion }}
        </template>
        <template #item.name="{ item }">
          <v-icon
            v-if="item.labels && item.labels['pai.kubegems.io/node-role.compute'] === 'true'"
            color="primary"
            small
          >
            mdi-alpha-w-circle
          </v-icon>
          <v-icon
            v-if="item.labels && item.labels['pai.kubegems.io/node-role.manager'] === 'true'"
            color="primary"
            small
          >
            mdi-alpha-c-circle
          </v-icon>
          <v-icon v-if="item.labels && item.labels['pai.kubegems.io/node-role.app'] === 'true'" color="primary" small>
            mdi-alpha-a-circle
          </v-icon>
          <v-icon
            v-if="item.labels && item.labels['pai.kubegems.io/node-role.storage'] === 'true'"
            color="primary"
            small
          >
            mdi-alpha-s-circle
          </v-icon>
          {{ item.name }}
          <ShareGPUTip
            v-if="item.labels && item.labels['pai.kubegems.io/vgpu-enabled'] === 'true'"
            :gpu="getGpuOrVgpuCount(item, 'gpu')"
            :vgpu="getGpuOrVgpuCount(item, 'sgpu')"
          >
            <template #trigger>
              <v-chip color="primary" label x-small> sGPU </v-chip>
            </template>
          </ShareGPUTip>
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="my-2 pa-2" :colspan="headers.length">
            <PodList v-if="item.show" :node="item.name" :region="region" />
          </td>
        </template>
        <template #item.action="{ item, index }">
          <v-flex :id="`r-cluster${index}`" />
          <v-menu :attach="`#r-cluster${index}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" small text @click.stop="showNodeMonitor(item)">
                    {{ i18nLocal.t('tip.node_monitor') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click.stop="labelNode(item)">
                    {{ i18nLocal.t('operate.label_compute') }}
                  </v-btn>
                </v-flex>
                <v-flex v-if="item.labels && item.labels['nvidia.com/gpu.product']">
                  <v-btn color="primary" small text @click.stop="setSGpu(item)">
                    {{ i18nLocal.t('operate.set_sgpu') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <NodeMonitor ref="monitor" :cluster="region" />
    <LabelNode ref="label" :selected-items="selectedNodeList" @refresh="getRegion" />
    <SetShareGPU ref="shareGpu" @refresh="getRegion" />
  </v-container>
</template>

<script lang="ts" setup>
  import { Vector } from '@kubegems/api/typed/prometheus';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams, useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import {
    // NODE_ALL_GPU_TOTAL_PROMQL,
    // NODE_ALL_GPU_USED_PROMQL,
    NODE_LOAD_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { onMounted, reactive, ref } from 'vue';

  import { NodeSummary, Region } from '../../api/region';
  import LabelNode from './components/LabelNode.vue';
  import NodeMonitor from './components/NodeMonitor.vue';
  import PodList from './components/PodList.vue';
  import ResourceViewer from './components/ResourceViewer/index.vue';
  import SetShareGPU from './components/SetShareGPU.vue';
  import ShareGPUTip from './components/ShareGPUTip.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start', sortable: false },
    { text: i18nLocal.t('table.status'), value: 'status', align: 'start', sortable: false },
    { text: i18nLocal.t('table.driver'), value: 'driver', align: 'start', sortable: false },
    { text: i18nLocal.t('table.cuda'), value: 'cuda', align: 'start', sortable: false },
    { text: i18nLocal.t('table.cpu'), value: 'cpuMode', align: 'start' },
    { text: i18nLocal.t('table.gpu'), value: 'gpuMode', align: 'start' },
    { text: i18nLocal.t('table.load'), value: 'load', align: 'start' },
    { text: i18nLocal.t('table.gpu_used'), value: 'gpuUsed', align: 'start', width: 140, sortable: false },
    { text: i18nLocal.t('table.cpu_used'), value: 'cpuUsed', align: 'start', width: 140, sortable: false },
    { text: i18nLocal.t('table.memory_used'), value: 'memoryUsed', align: 'start', width: 155, sortable: false },
    { text: '', value: 'action', align: 'center', width: 20 },
    { text: '', value: 'data-table-expand' },
  ];

  let pagination: Pagination<NodeSummary> = reactive<Pagination<NodeSummary>>({
    page: 1,
    size: 1000,
    pageCount: 0,
    items: [],
    search: '',
  });

  const state = reactive({
    refresh: false,
  });

  const routeParams = useParams();
  const region = ref<Region>(void 0);
  const itemsCopy = ref([]);
  const getRegion = async (): Promise<void> => {
    if (!state.refresh) {
      region.value = await new Region({ name: routeParams.value.name }).getRegion();
      pagination.items = region.value.nodes;
      pagination.items.forEach((item) => {
        item.gpuMode = `${item?.resources?.['nvidia.com/gpu']?.productName} × ${item?.resources?.['nvidia.com/gpu']?.total}`;
        item.cpuMode = `${item?.resources?.cpu?.productName} × ${item?.resources?.cpu?.total}`;
      });
      pagination.items = pagination.items.slice();
      itemsCopy.value = deepCopy(pagination.items);
    }
    nodeCPUUsage();
    nodeMemoryUsage();
    nodeGPUUsage();
    nodeLoad5();
  };

  const filters = [
    { text: i18nLocal.t('filter.name'), value: 'search', items: [] },
    {
      text: i18nLocal.t('filter.role'),
      value: 'role',
      items: [
        { text: i18nLocal.t('tip.compute'), value: 'compute', parent: 'role' },
        { text: i18nLocal.t('tip.controller'), value: 'controller', parent: 'role' },
        { text: i18nLocal.t('tip.public'), value: 'public', parent: 'role' },
        { text: i18nLocal.t('tip.data'), value: 'data', parent: 'role' },
      ],
    },
  ];

  const getColor = (percentage: number): string => {
    return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
  };

  const query = useQuery();
  const customFilter = (): void => {
    let [searchResult, roleResult] = [true, true];
    pagination.items = itemsCopy.value.filter((item) => {
      if (query.value.search) {
        searchResult = item.name && item.name.toLocaleLowerCase().indexOf(query.value.search.toLocaleLowerCase()) > -1;
      }
      if (query.value.role) {
        roleResult =
          item.metadata?.labels?.['pai.kubegems.io/node-role']
            ?.toLocaleLowerCase()
            ?.indexOf(query.value.role.toLocaleLowerCase()) > -1;
      }
      return searchResult && roleResult;
    });
  };

  const nodeCPUUsage = async (): Promise<void> => {
    pagination.items.forEach((item) => {
      const use = sizeOfCpu(item?.resources?.cpu?.used || '0');
      const total = sizeOfCpu(item?.resources?.cpu?.total || '0');
      item.cpu = use.toFixed(1);
      item.cpuPercentage = ((use / total) * 100).toFixed(1);
      item.cpuTotal = total.toFixed(1);
    });
    pagination.items = pagination.items.slice();
  };

  // const nodeGPUUsage = async (): Promise<void> => {
  //   const data = await new Vector().getVector(region.value.clusterName, {
  //     query: NODE_ALL_GPU_TOTAL_PROMQL.replaceAll('%', ''),
  //     noprocessing: true,
  //   });
  //   const dataUsage = await new Vector().getVector(region.value.clusterName, {
  //     query: NODE_ALL_GPU_USED_PROMQL.replaceAll('%', ''),
  //     noprocessing: true,
  //   });
  //   data.forEach((d) => {
  //     const index = pagination.items.findIndex((node) => {
  //       return d.metric.node === node.name;
  //     });
  //     if (index > -1) {
  //       const item = pagination.items[index];
  //       const usage = dataUsage.find((t) => t.metric.node === d.metric.node);
  //       item.gpu = usage ? parseInt(usage?.value[1].toString()) : 0;
  //       item.gpuPercentage = ((item.gpu / parseInt(d?.value[1].toString())) * 100).toFixed(1);
  //       item.gpuTotal = parseInt(d?.value[1].toString());
  //       pagination.items[index] = item;
  //     }
  //   });
  //   pagination.items = pagination.items.slice();
  // };

  const nodeGPUUsage = async (): Promise<void> => {
    pagination.items.forEach((item) => {
      const use = parseInt(item?.resources?.['nvidia.com/gpu']?.used || '0');
      const total = parseInt(item?.resources?.['nvidia.com/gpu']?.total || '0');
      item.gpu = use;
      item.gpuPercentage = ((use / total) * 100).toFixed(1);
      item.gpuTotal = total;
    });
    pagination.items = pagination.items.slice();
  };

  const nodeMemoryUsage = async (): Promise<void> => {
    pagination.items.forEach((item) => {
      const use = sizeOfStorage(item?.resources?.memory?.used || '0');
      const total = sizeOfStorage(item?.resources?.memory?.total || '0');
      item.memory = parseFloat(use?.toString() || '0').toFixed(1);
      item.memoryPercentage = ((use / total) * 100).toFixed(1);
      item.memoryTotal = parseFloat(total?.toString() || '0').toFixed(1);
    });
    pagination.items = pagination.items.slice();
  };

  const getLoadColor = (item: NodeSummary): string => {
    const cpu = parseFloat(item.resources.cpu?.total || '0');
    if (item.load > cpu) {
      return 'red lighten-3';
    }
    return 'green lighten-4';
  };
  const nodeLoad5 = async (): Promise<void> => {
    const data = await new Vector().getVector(region.value.clusterName, {
      query: NODE_LOAD_PROMQL.replaceAll('%', ''),
      noprocessing: true,
    });
    data.forEach((d) => {
      const index = pagination.items.findIndex((node) => {
        return d.metric.node === node.name;
      });
      if (index > -1) {
        const item = pagination.items[index];
        item.load = parseFloat(d?.value[1].toString()).toFixed(1);
        pagination.items[index] = item;
      }
    });
    pagination.items = pagination.items.slice();
  };

  onMounted(() => {
    getRegion();
  });

  const monitor = ref(null);
  const showNodeMonitor = (item: NodeSummary): void => {
    monitor.value.init(item);
    monitor.value.open();
  };

  const label = ref(null);
  const labelNode = (item: NodeSummary) => {
    label.value.init(item, region.value);
    label.value.open();
  };

  const onRowClick = (item, { expand, isExpanded }) => {
    item.show = !isExpanded;
    expand(!isExpanded);
  };

  const onExpanded = (items) => {
    if (items?.length > 0) {
      const [item] = items;
      item.show = true;
    } else {
      pagination.items.forEach((item) => {
        item.show = false;
      });
    }
  };

  const shareGpu = ref(null);
  const setSGpu = (item: NodeSummary) => {
    shareGpu.value.init(item, region.value);
    shareGpu.value.open();
  };

  const getGpuOrVgpuCount = (item: NodeSummary, type = 'gpu') => {
    if (type === 'gpu') return item?.resources?.['nvidia.com/gpu'];
    if (type === 'sgpu') return item?.resources?.['volcano.sh/vgpu-number'];
    return void 0;
  };

  const selectedNodeList = ref<NodeSummary[]>([]);
  const toggleSelectAll = (params: { items: NodeSummary[]; value: boolean }): void => {
    if (params.value) {
      selectedNodeList.value = deepCopy(params.items);
    } else {
      selectedNodeList.value = [];
    }
  };
  const selected = (params: { item: NodeSummary; value: boolean }): void => {
    const index = selectedNodeList.value.findIndex((u) => {
      return u.name === params.item.name;
    });
    if (params.value) {
      if (index === -1) selectedNodeList.value.push(params.item);
    } else {
      if (index > -1) selectedNodeList.value.splice(index, 1);
    }
  };

  const batchSetRole = () => {
    if (selectedNodeList.value.length === 0) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.batch_select_c', [i18n.t('resource.node')]),
        color: 'warning',
      });
      return;
    }
    label.value.init(void 0, region.value, true);
    label.value.open();
  };
</script>
