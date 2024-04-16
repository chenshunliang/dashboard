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
  <BasePanel v-model="state.panel" icon="mdi-format-list-text" :title="title" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-3 text-subtitle-2 white--text" />
    </template>
    <template #content>
      <v-card
        flat
        :style="{
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: `calc((100vh - 64px) / ${store.state.Scale} - 1px)`,
        }"
      >
        <div class="ma-4 text-body-1">
          <div>{{ i18nLocal.t('tip.tenant_max_resource') }}: {{ used }} / {{ total }}</div>
        </div>

        <v-tabs v-model="tab" class="rounded-t mx-4" height="30" @change="tabChanged">
          <v-tab v-for="item in tabItems" :key="item.value">
            {{ item.text }}
            ({{ tabCount[item.value] }}<span v-if="state.type === 'memory'">Gi</span>)
          </v-tab>
        </v-tabs>
        <div v-if="tabItems[tab].value === 'modeling'" class="mx-4 text-body-2 orange--text my-2">
          <v-icon color="orange" small>mdi-alert</v-icon>
          {{ i18nLocal.t('tip.modeling_alert') }}
        </div>
        <v-simple-table class="mx-2 pa-2 pb-3">
          <template #default>
            <thead>
              <tr>
                <th class="text-left">{{ i18nLocal.t('table.job') }}</th>
                <th class="text-left">{{ i18nLocal.t('table.creator') }}</th>
                <th class="text-left">{{ i18nLocal.t('table.desc') }}</th>
                <th v-if="state.type !== 'job'" class="text-left">{{ i18nLocal.t(`tip.${state.type || 'cpu'}`) }}</th>
                <th class="text-left">{{ i18nLocal.t(`table.m1_${state.type || 'cpu'}`) }}</th>
                <th class="text-left"> {{ i18nLocal.t(`table.m2_${state.type || 'cpu'}`) }} </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in jobItems" :key="index">
                <td>
                  <div class="float-left mr-1">
                    <BaseStatus :bg-color="POD_STATUS_COLOR[item.phase]" />
                  </div>
                  <div class="float-left">
                    {{ item.name }}
                  </div>
                </td>
                <td>{{ item.creator }}</td>
                <td>{{ item.description }}</td>
                <td v-if="state.type !== 'job'">{{ item.resource.limit || '-' }}</td>
                <td>
                  {{ item.m1 || '-' }}
                  <v-progress-linear
                    v-if="state.type !== 'job'"
                    class="rounded font-weight-medium"
                    :color="getColor(item.m1Precent)"
                    height="15"
                    :value="item.m1Precent"
                  >
                    <span class="white--text">{{ item.m1Precent ? item.m1Precent.toFixed(2) : '' }}% </span>
                  </v-progress-linear>
                </td>
                <td>
                  {{ item.m2 || '-' }}
                  <v-progress-linear
                    v-if="state.type !== 'job'"
                    class="rounded font-weight-medium"
                    :color="getColor(item.m2Precent)"
                    height="15"
                    :value="item.m2Precent"
                  >
                    <span class="white--text">{{ item.m2Precent ? item.m2Precent.toFixed(2) : '' }}% </span>
                  </v-progress-linear>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import { Vector } from '@kubegems/api/typed/prometheus';
  import { useStore } from '@kubegems/extension/store';
  import {
    NVIDIA_CPU_MAX_DURATION_PROMQL,
    NVIDIA_MEMORY_MAX_DURATION_PROMQL,
    POD_AVG_CPU_USAGE_DURATION_PROMQL,
    POD_AVG_MEMORY_USAGE_DURATION_PROMQL,
    POD_MAX_CPU_USAGE_DURATION_PROMQL,
    POD_MAX_MEMORY_USAGE_DURATION_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import { beautifyCpuUnit, beautifyStorageUnit, sizeOfCpu, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { computed, reactive, ref } from 'vue';

  import { Region } from '../../../../api/region';
  import { JobResource, Tenant } from '../../../../api/tenant';
  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      region?: Region;
    }>(),
    {
      region: void 0,
    },
  );

  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    panel: false,
    type: '',
    used: '',
    total: 0,
  });

  const tab = ref(0);
  const tabItems = [
    { text: i18nLocal.t('tip.modeling'), value: 'modeling' },
    { text: i18nLocal.t('tip.training'), value: 'training' },
    { text: i18nLocal.t('tip.inference'), value: 'inference' },
  ];
  const tabCount = ref({
    modeling: 0,
    training: 0,
    inference: 0,
  });

  const used = computed(() => {
    if (state.type === 'cpu') {
      return state.used + 'core';
    }
    if (state.type === 'memory') {
      return state.used + 'Gi';
    }
    if (state.type === 'gpu') {
      return state.used;
    }
    return state.used;
  });

  const total = computed(() => {
    if (state.type === 'cpu') {
      return state.total.toFixed(1) + 'core';
    }
    if (state.type === 'memory') {
      return state.total.toFixed(1) + 'Gi';
    }
    if (state.type === 'gpu') {
      return state.total.toFixed(1);
    }
    return state.total;
  });

  const titleMap = {
    cpu: i18nLocal.t('tip.cpu'),
    memory: i18nLocal.t('tip.memory'),
    gpu: i18nLocal.t('tip.gpu'),
    job: i18nLocal.t('tip.job'),
  };

  const title = computed(() => {
    return `${store.getters.Tenant().TenantName} ${titleMap[state.type]} ${i18nLocal.t('tip.used_detail')}`;
  });

  const open = (): void => {
    state.panel = true;
  };
  const init = (type: string, used: string, total: number): void => {
    state.type = type;
    state.used = used;
    state.total = total;
    getJobList();
  };
  defineExpose({
    open,
    init,
  });

  const jobItems = ref<JobResource[]>([]);
  const getJobList = async (): Promise<void> => {
    const data = await new Tenant({
      region: props.region.name,
      tenant: store.getters.Tenant().TenantName,
    }).getResourceDetail(state.type, { page: 1, size: 1000 });
    jobItems.value = [];
    tabCount.value = {
      modeling: 0,
      training: 0,
      inference: 0,
    };
    data.jobs.forEach((item) => {
      if (item.phase === 'Running') {
        if (item?.labels?.['pai.kubegems.io/job-kind'] === tabItems[tab.value].value) {
          jobItems.value.push(item);
        }
        if (state.type === 'cpu') {
          tabCount.value[item?.labels?.['pai.kubegems.io/job-kind']] += sizeOfCpu(item.resource.limit) || 0;
        } else if (state.type === 'memory') {
          tabCount.value[item?.labels?.['pai.kubegems.io/job-kind']] += sizeOfStorage(item.resource.limit) || 0;
        } else if (state.type === 'gpu') {
          tabCount.value[item?.labels?.['pai.kubegems.io/job-kind']] += parseInt(item.resource.limit) || 0;
        } else {
          tabCount.value[item?.labels?.['pai.kubegems.io/job-kind']] += 1;
        }
      }
    });
    if (jobItems.value.length === 0) return;
    let [m1, m2] = [[], []];
    if (state.type === 'cpu') {
      m1 = await podCPUMAXUsage();
      m2 = await podCPUAVGUsage();
    } else if (state.type === 'memory') {
      m1 = await podMemoryMAXUsage();
      m2 = await podMemoryAVGUsage();
    } else if (state.type === 'gpu') {
      m1 = await podGPUMAXUsage();
      m2 = await podGPUMemoryMAXUsage();
    }
    jobItems.value.forEach((item) => {
      const _m1 = m1.find((m) => {
        return m.metric.pod.startsWith(`${prefix.value}${item.name}`);
      });
      const _m2 = m2.find((m) => {
        return m.metric.pod.startsWith(`${prefix.value}${item.name}`);
      });
      if (state.type === 'cpu') {
        item.m1 = beautifyCpuUnit(parseFloat(_m1.value[1]) * 1000 * 1000 * 1000, 3);
        item.m2 = beautifyCpuUnit(parseFloat(_m2.value[1]) * 1000 * 1000 * 1000, 3);
        item.m1Precent = (parseFloat(_m1.value[1]) / sizeOfCpu(item.resource.limit || 0)) * 100;
        item.m2Precent = (parseFloat(_m2.value[1]) / sizeOfCpu(item.resource.limit || 0)) * 100;
      } else if (state.type === 'memory') {
        item.m1 = beautifyStorageUnit(_m1.value[1], 2);
        item.m2 = beautifyStorageUnit(_m2.value[1], 2);
        item.m1Precent =
          (parseFloat(_m1.value[1]) / 1024 / 1024 / 1024 / sizeOfStorage(item.resource.limit || 0)) * 100;
        item.m2Precent =
          (parseFloat(_m2.value[1]) / 1024 / 1024 / 1024 / sizeOfStorage(item.resource.limit || 0)) * 100;
      } else if (state.type === 'gpu') {
        item.m1 = _m1.value[1] + '%';
        item.m2 = _m2.value[1] + '%';
        item.m1Precent = parseFloat(_m1.value[1]);
        item.m2Precent = parseFloat(_m2.value[1]);
      } else if (state.type === 'job') {
        item.m1 = item.priority;
        item.m2 = moment(item.updatedAt, 'YYYY-MM-DDTHH:mm:ssZ').format('lll');
        item.m1Precent = 0;
        item.m2Precent = 0;
      }
    });
    jobItems.value = jobItems.value.slice();
  };

  const prefix = computed(() => {
    // if (tabItems[tab.value].value === 'modeling') {
    //   return 'im-';
    // } else if (tabItems[tab.value].value === 'inference') {
    //   return 'inference-';
    // } else {
    return `${store.getters.Tenant().TenantName}-`;
    // }
  });

  const podCPUMAXUsage = async (): Promise<Vector[]> => {
    let query = POD_MAX_CPU_USAGE_DURATION_PROMQL.replaceAll(
      '$1',
      jobItems.value
        .map((j) => {
          return `${prefix.value}${j.name}.*`;
        })
        .join('|'),
    );
    query = query.replaceAll('%', '');
    return await new Vector().getVector(props.region.clusterName, { query: query, noprocessing: true });
  };
  const podCPUAVGUsage = async (): Promise<Vector[]> => {
    let query = POD_AVG_CPU_USAGE_DURATION_PROMQL.replaceAll(
      '$1',
      jobItems.value
        .map((j) => {
          return `${prefix.value}${j.name}.*`;
        })
        .join('|'),
    );
    query = query.replaceAll('%', '');
    return await new Vector().getVector(props.region.clusterName, { query: query, noprocessing: true });
  };

  const podMemoryMAXUsage = async (): Promise<Vector[]> => {
    let query = POD_MAX_MEMORY_USAGE_DURATION_PROMQL.replaceAll(
      '$1',
      jobItems.value
        .map((j) => {
          return `${prefix.value}${j.name}.*`;
        })
        .join('|'),
    );
    query = query.replaceAll('%', '');
    return await new Vector().getVector(props.region.clusterName, { query: query, noprocessing: true });
  };
  const podMemoryAVGUsage = async (): Promise<Vector[]> => {
    let query = POD_AVG_MEMORY_USAGE_DURATION_PROMQL.replaceAll(
      '$1',
      jobItems.value
        .map((j) => {
          return `${prefix.value}${j.name}.*`;
        })
        .join('|'),
    );
    query = query.replaceAll('%', '');
    return await new Vector().getVector(props.region.clusterName, { query: query, noprocessing: true });
  };

  const podGPUMAXUsage = async (): Promise<Vector[]> => {
    let query = NVIDIA_CPU_MAX_DURATION_PROMQL.replaceAll(
      '$1',
      jobItems.value
        .map((j) => {
          return `${prefix.value}${j.name}.*`;
        })
        .join('|'),
    );
    query = query.replaceAll('%', '');
    return await new Vector().getVector(props.region.clusterName, { query: query, noprocessing: true });
  };
  const podGPUMemoryMAXUsage = async (): Promise<Vector[]> => {
    let query = NVIDIA_MEMORY_MAX_DURATION_PROMQL.replaceAll(
      '$1',
      jobItems.value
        .map((j) => {
          return `${prefix.value}${j.name}.*`;
        })
        .join('|'),
    );
    query = query.replaceAll('%', '');
    return await new Vector().getVector(props.region.clusterName, { query: query, noprocessing: true });
  };

  const dispose = () => {
    state.panel = false;
    jobItems.value = [];
  };

  const tabChanged = () => {
    getJobList();
  };

  const getColor = (percentage: number): string => {
    return percentage ? (percentage < 60 ? 'primary' : percentage < 80 ? 'warning' : 'red darken-1') : 'primary';
  };
</script>
