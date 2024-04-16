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
    <v-data-table
      class="mx-4 pb-4 kubegems__table-row-pointer"
      :custom-sort="customSort"
      :headers="headers"
      hide-default-footer
      item-key="metadata.uid"
      :items="podItems"
      :items-per-page="1000"
      :no-data-text="i18n.t('data.no_data')"
      :page="1"
      show-expand
      single-expand
      :sort-by="'instanceId'"
      @click:row="onRowClick"
    >
      <template #item.instanceId="{ item }">
        {{ item.metadata.name }}

        <v-btn color="primary" icon small @click.stop="openContainerLog(item)">
          <v-icon color="primary" small>mdi-file-document</v-icon>
        </v-btn>
        <v-btn color="primary" icon small @click.stop="openTerminal(item)">
          <v-icon color="primary" small>mdi-console</v-icon>
        </v-btn>
      </template>
      <template #item.instanceStatus="{ item }">
        <EventTip for="pai" :item="item" kind="Pod">
          <template #trigger>
            <span
              :class="`v-avatar mr-2 ${
                ['ContainerCreating', 'Pending', 'Terminating', 'PodInitializing'].indexOf(usePodStatus(item)) > -1
                  ? 'kubegems__waiting-flashing'
                  : ''
              }`"
              :style="{
                height: '10px',
                minWidth: '10px',
                width: '10px',
                marginTop: '-2px',
                backgroundColor: `${POD_STATUS_COLOR[usePodStatus(item)] || config.theme.THEME_COLOR_EXTEND.error}`,
              }"
            />
            <span>
              {{ usePodStatus(item) }}
            </span>
            <span>
              ({{
                item.status && item.status.containerStatuses
                  ? item.status.containerStatuses.filter((c) => {
                      return c.ready;
                    }).length
                  : 0
              }}/{{ item.spec.containers.length }})
            </span>
          </template>
        </EventTip>
      </template>
      <template #item.restart="{ item }">
        {{ getRestart(item.status.containerStatuses) }}
      </template>
      <template #item.age="{ item }">
        {{ item.status.startTime ? moment(item.status.startTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
      </template>
      <template #item.instanceIp="{ item }">
        {{ item.status.podIP }}
      </template>
      <template #item.hostIp="{ item }">
        {{ item.status.hostIP }}
      </template>
      <template #item.cpu="{ item }">
        <template v-if="item.cpu">
          {{ item.cpu }}/{{ item.cpuTotal }}
          <v-progress-linear
            class="rounded font-weight-medium"
            :color="getColor(item.cpuPercentage)"
            height="15"
            :value="item.cpuPercentage"
          >
            <span class="white--text"> {{ item.cpuPercentage || '-' }}% </span>
          </v-progress-linear>
        </template>
        <template v-else> - </template>
      </template>
      <template #item.memory="{ item }">
        <template v-if="item.memory">
          {{ item.memory }}/{{ item.memoryTotal }}
          <v-progress-linear
            class="rounded font-weight-medium"
            :color="getColor(item.memoryPercentage)"
            height="15"
            :value="item.memoryPercentage"
          >
            <span class="white--text"> {{ item.memoryPercentage || '-' }}% </span>
          </v-progress-linear>
        </template>
        <template v-else> - </template>
      </template>
      <template #item.gpu="{ item }">
        <template v-if="Object.prototype.hasOwnProperty.call(item, 'gpu')">
          {{ item.gpu }}/{{ item.gpuTotal }}
          <v-progress-linear
            class="rounded font-weight-medium"
            :color="getColor(item.gpuPercentage)"
            height="15"
            :value="item.gpuPercentage"
          >
            <span class="white--text"> {{ item.gpuPercentage || '-' }}% </span>
          </v-progress-linear>
        </template>
        <template v-else> - </template>
      </template>
      <template #item.gpuMemory="{ item }">
        <template v-if="Object.prototype.hasOwnProperty.call(item, 'gpuMemory')">
          {{ item.gpuMemory }}/{{ item.gpuMemoryTotal }}
          <v-progress-linear
            class="rounded font-weight-medium"
            :color="getColor(item.gpuMemoryPercentage)"
            height="15"
            :value="item.gpuMemoryPercentage"
          >
            <span class="white--text"> {{ item.gpuMemoryPercentage || '-' }}% </span>
          </v-progress-linear>
        </template>
        <template v-else> - </template>
      </template>
      <template #expanded-item="{ headers, item }">
        <td class="my-2 pa-2" :colspan="headers.length">
          <ContainerItem :pod="item" />
        </td>
      </template>
      <template #item.action="{ item }">
        <v-flex :id="`r${item.metadata.resourceVersion}`" />
        <v-menu :attach="`#r${item.metadata.resourceVersion}`" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="error" small text @click.stop="removePod(item)">
                  {{ i18n.t('operate.restart') }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-data-table>

    <RemoteShell ref="shell" @openWebShell="openWebShell" />
    <Terminal ref="terminal" :config="config" />
    <ContainerLog ref="containerLog" :config="config" />
  </div>
</template>

<script lang="ts" setup>
  import { usePodStatus } from '@kubegems/api/hooks/pod';
  import { Pod } from '@kubegems/api/typed/pod';
  import { Vector } from '@kubegems/api/typed/prometheus';
  import ContainerLog from '@kubegems/components/logicComponents/ContainerLog.vue';
  import EventTip from '@kubegems/components/logicComponents/EventTip.vue';
  import Terminal from '@kubegems/components/logicComponents/Terminal/index.vue';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { SERVICE_PAI } from '@kubegems/libs/constants/namespace';
  import {
    NVIDIA_GPU_BY_POD_PROMQL,
    NVIDIA_GPU_MEMORY_BY_POD_PROMQL,
    NVIDIA_GPU_MEMORY_BY_POD_TOTAL_PROMQL,
    POD_CPU_USAGE_PROMQL,
    POD_MEMORY_USAGE_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import { beautifyCpuUnit, beautifyStorageUnit, sizeOfCpu, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { Job } from '../../../../../api/job';
  import { useI18n } from '../../../i18n';
  import ContainerItem from './ContainerItem.vue';
  import RemoteShell from './RemoteShell.vue';

  const props = withDefaults(
    defineProps<{
      job?: Job;
    }>(),
    {
      job: void 0,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const headers = [
    { text: i18nLocal.t('table.instance_id'), value: 'instanceId', align: 'start' },
    { text: i18nLocal.t('table.instance_status'), value: 'instanceStatus', align: 'start', sortable: false },
    { text: i18nLocal.t('table.restart'), value: 'restart', align: 'start', sortable: false, width: 50 },
    { text: i18nLocal.t('table.age'), value: 'age', align: 'start', sortable: false },
    { text: i18nLocal.t('table.instance_ip'), value: 'instanceIp', align: 'start', sortable: false },
    { text: i18nLocal.t('table.host_ip'), value: 'hostIp', align: 'start', sortable: false },
    { text: i18nLocal.t('table.cpu_usage'), value: 'cpu', align: 'start', sortable: false, width: 150 },
    { text: i18nLocal.t('table.memory_usage'), value: 'memory', align: 'start', sortable: false, width: 150 },
    { text: i18nLocal.t('table.gpu_usage'), value: 'gpu', align: 'start', sortable: false, width: 150 },
    { text: i18nLocal.t('table.gpu_memory_usage'), value: 'gpuMemory', align: 'start', sortable: false, width: 150 },
    { text: '', value: 'action', align: 'center', width: 20, sortable: false },
    { text: '', value: 'data-table-expand' },
  ];

  const onRowClick = (item, { expand, isExpanded }) => {
    expand(!isExpanded);
  };

  const podItems = ref<Pod[]>([]);
  const getPodList = async (): Promise<void> => {
    podItems.value = await new Job(props.job).getPodListInJob({ noprocessing: state.refresh });
    podCPUUsage();
    podMemoryUsage();
    podGPUUsage();
    podGPUMemoryUsage();
  };

  const customSort = (items, sortBy, sortDesc) => {
    const [field] = sortBy;
    const [desc] = sortDesc;
    items.sort((a, b) => {
      if (field === 'instanceId') {
        const aLast = parseInt(a.metadata.name.split('-').pop() || '0');
        const bLast = parseInt(b.metadata.name.split('-').pop() || '0');
        return desc ? bLast - aLast : aLast - bLast;
      }
    });
    return items;
  };

  const getRestart = (containerStatuses: any[]): number => {
    let sum = 0;
    if (containerStatuses) {
      containerStatuses.forEach((con) => {
        sum += con.restartCount;
      });
    }
    return sum;
  };

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  const state = reactive({
    refresh: false,
  });
  watch(
    () => props.job,
    (newValue) => {
      if (newValue && newValue.name) {
        if (_cancel) _cancel();
        const { cancel } = useRequest(getPodList, {
          pollingInterval: 1000 * 30,
          onSuccess: () => {
            state.refresh = true;
          },
        });
        _cancel = cancel;
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

  const getColor = (percentage: number): string => {
    return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
  };

  const podCPUUsage = async (): Promise<void> => {
    const podStrs = podItems.value
      .map((p) => {
        return p.metadata.name;
      })
      .join('|');
    let query = POD_CPU_USAGE_PROMQL.replaceAll('$1', podStrs).replaceAll('$2', SERVICE_PAI);
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(store.getters.Region().ClusterName, {
      query: query,
      noprocessing: true,
    });
    data.forEach((d) => {
      const index = podItems.value.findIndex((pod) => {
        return d.metric.pod === pod.metadata.name;
      });
      if (index > -1) {
        const item = podItems.value[index];
        const total = sizeOfCpu(podItems.value[index]?.spec?.containers?.[0]?.resources?.limits?.cpu || 0);
        item.cpuTotal = beautifyCpuUnit(total * 1000 * 1000 * 1000, 0);
        item.cpu = beautifyCpuUnit(parseFloat(d?.value[1].toString()), 1);
        item.cpuPercentage = ((parseFloat(d?.value[1].toString()) / 1000 / 1000 / 1000 / total) * 100).toFixed(1);
        podItems.value[index] = item;
      }
    });
    podItems.value = podItems.value.slice();
  };

  const podMemoryUsage = async (): Promise<void> => {
    const podStrs = podItems.value
      .map((p) => {
        return p.metadata.name;
      })
      .join('|');
    let query = POD_MEMORY_USAGE_PROMQL.replaceAll('$1', podStrs).replaceAll('$2', SERVICE_PAI);
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(store.getters.Region().ClusterName, {
      query: query,
      noprocessing: true,
    });
    data.forEach((d) => {
      const index = podItems.value.findIndex((pod) => {
        return d.metric.pod === pod.metadata.name;
      });
      if (index > -1) {
        const item = podItems.value[index];
        const total =
          sizeOfStorage(podItems.value[index]?.spec?.containers?.[0]?.resources?.limits?.memory || 0) * 1024;
        item.memoryTotal = beautifyStorageUnit(total * 1024 * 1024, 0);
        item.memory = beautifyStorageUnit(parseFloat(d?.value[1].toString()) * 1024 * 1024, 1);
        item.memoryPercentage = ((parseFloat(d?.value[1].toString()) / total) * 100).toFixed(1);
        podItems.value[index] = item;
      }
    });
    podItems.value = podItems.value.slice();
  };

  const podGPUUsage = async (): Promise<void> => {
    const podStrs = podItems.value
      .map((p) => {
        return p.metadata.name;
      })
      .join('|');

    let query = NVIDIA_GPU_BY_POD_PROMQL.replaceAll('$1', podStrs);
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(store.getters.Region().ClusterName, {
      query: query,
      noprocessing: true,
    });
    data.forEach((d) => {
      const index = podItems.value.findIndex((pod) => {
        return d.metric.pod === pod.metadata.name;
      });
      if (index > -1) {
        const item = podItems.value[index];
        item.gpuTotal = parseInt(
          podItems.value[index]?.spec?.containers?.[0]?.resources?.limits?.['nvidia.com/gpu'] || '0',
        );
        item.gpu = Math.ceil((parseFloat(d?.value[1].toString()) * item.gpuTotal) / 100);
        item.gpuPercentage = parseFloat(d?.value[1].toString()).toFixed(1);
        podItems.value[index] = item;
      }
    });
    podItems.value = podItems.value.slice();
  };

  const podGPUMemoryUsage = async (): Promise<void> => {
    const podStrs = podItems.value
      .map((p) => {
        return p.metadata.name;
      })
      .join('|');

    let query = NVIDIA_GPU_MEMORY_BY_POD_PROMQL.replaceAll('$1', podStrs);
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(store.getters.Region().ClusterName, {
      query: query,
      noprocessing: true,
    });
    const dataTotal = await new Vector().getVector(store.getters.Region().ClusterName, {
      query: NVIDIA_GPU_MEMORY_BY_POD_TOTAL_PROMQL.replaceAll('$1', podStrs),
      noprocessing: true,
    });
    data.forEach((d) => {
      const index = podItems.value.findIndex((pod) => {
        return d.metric.pod === pod.metadata.name;
      });
      if (index > -1) {
        const item = podItems.value[index];
        const total = parseInt(
          dataTotal
            .find((d) => {
              return d.metric.pod === item.metadata.name;
            })
            ?.value[1].toString() || '0',
        );
        item.gpuMemoryTotal = beautifyStorageUnit(total * 1024 * 1024, 1);
        item.gpuMemoryPercentage = parseFloat(d?.value[1].toString()).toFixed(1);
        item.gpuMemory = beautifyStorageUnit((total * parseFloat(d?.value[1].toString()) * 1024 * 1024) / 100, 1);
        podItems.value[index] = item;
      }
    });
    podItems.value = podItems.value.slice();
  };

  const shell = ref(null);
  const openTerminal = (item: Pod): void => {
    shell.value.init(item);
    shell.value.open();
  };

  const terminal = ref(null);
  const openWebShell = (pod: Pod): void => {
    const container = pod.spec.containers[0].name;
    const item = {
      namespace: pod.metadata.namespace,
      name: pod.metadata.name,
      containers: pod.status.containerStatuses,
    };
    terminal.value.init(container, item, 'shell', false, true);
    terminal.value.open('pai');
  };

  const containerLog = ref(null);
  const openContainerLog = (pod: Pod) => {
    const container = pod.spec.containers?.length > 0 ? pod.spec.containers[0].name : '';
    const item = {
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
    containerLog.value.init(container, item, false, true);
    containerLog.value.open();
  };

  const removePod = (item: Pod) => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.pod')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.pod')])} ${item.metadata.name}`,
        type: 'delete',
        name: item.metadata.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.metadata.name.length > 0) {
          await new Pod({
            metadata: { name: param.item.metadata.name, namespace: param.item.metadata.namespace },
          }).deletePod(store.getters.Region().ClusterName);
          getPodList();
        }
      },
    });
  };
</script>
