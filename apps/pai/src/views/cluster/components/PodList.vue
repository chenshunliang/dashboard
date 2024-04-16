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
  <div class="py-4">
    <v-data-table
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      loader-height="3"
      :loading="state.loading"
      :loading-text="i18n.t('data.loading')"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #item.pod="{ item }">
        {{ item.name }}
        <v-btn color="primary" icon small @click.stop="toDetail(item)">
          <v-icon small>mdi-open-in-new</v-icon>
        </v-btn>
      </template>
      <template #item.sku="{ item }">
        {{ item.skuName }}
      </template>
      <template #item.priority="{ item }">
        {{ item.priorityClassName }}
      </template>
      <template #item.queue="{ item }">
        <v-icon v-if="item.queueName === 'im'" color="primary" small>mdi-developer-board</v-icon>
        <v-icon v-else-if="item.queueName === 'inference'" color="primary" small>mdi-head-snowflake-outline</v-icon>
        <v-icon v-else color="primary" small>mdi-function-variant</v-icon>
        {{ item.queueName }}
      </template>
      <template #item.tenant="{ item }">
        {{ item.tenant }}
      </template>
      <template #item.creator="{ item }">
        {{ item.creator }}
      </template>
      <template #item.cpu="{ item }">
        {{ item.cpu || '-' }}
        <template v-if="item.cpu">
          <v-icon v-if="item.cpuTrend === 'up'" color="error" small> mdi-trending-up </v-icon>
          <v-icon v-else-if="item.cpuTrend === 'down'" color="success" small> mdi-trending-down </v-icon>
          <v-icon v-else-if="item.cpuTrend === 'neutral'" color="primary" small> mdi-trending-neutral </v-icon>
        </template>
      </template>
      <template #item.memory="{ item }">
        {{ item.memory || '-' }}
        <template v-if="item.memory">
          <v-icon v-if="item.memoryTrend === 'up'" color="error" small> mdi-trending-up </v-icon>
          <v-icon v-else-if="item.memoryTrend === 'down'" color="success" small> mdi-trending-down </v-icon>
          <v-icon v-else-if="item.memoryTrend === 'neutral'" color="primary" small> mdi-trending-neutral </v-icon>
        </template>
      </template>
      <template #item.gpu="{ item }">
        <div v-for="(gpu, index) in Object.values(item.gpu || [])" :key="index">
          <div class="table__progress">
            <v-progress-linear
              class="rounded font-weight-medium mt-2"
              :color="getColor(parseFloat(gpu.toString()))"
              height="15"
              :value="gpu"
            >
              <span class="white--text"> {{ gpu }}% </span>
            </v-progress-linear>
          </div>
        </div>
        <div v-if="Object.keys(item.gpu || []).length === 0">-</div>
      </template>
      <template #item.gpuMemory="{ item }">
        <div v-for="(gpuMemory, index) in Object.values(item.gpuMemory || [])" :key="index">
          <div class="table__progress">
            <v-progress-linear
              class="rounded font-weight-medium mt-2"
              :color="getColor(parseFloat(gpuMemory.toString()))"
              height="15"
              :value="gpuMemory"
            >
              <span class="white--text"> {{ gpuMemory }}% </span>
            </v-progress-linear>
          </div>
        </div>
        <div v-if="Object.keys(item.gpuMemory || []).length === 0">-</div>
      </template>
      <template #item.gpuDevice="{ item }">
        <div v-for="(device, index) in Object.keys(item.gpu || [])" :key="index">
          <div class="float-left">
            <BaseLogo
              class="mr-2"
              :color="store.state.ThemeColor"
              default-logo="none"
              icon-name="nvidia"
              :ml="0"
              :mt="1"
              :width="20"
            />
          </div>
          <div class="float-left table__line"> No.</div>
          <div class="float-left table__no">
            <v-icon color="primary" left>{{ `mdi-numeric-${device[device.length - 1]}` }}</v-icon>
          </div>

          <div class="kubegems__clear-float" />
        </div>
        <div v-if="Object.keys(item.gpu || []).length === 0">-</div>
      </template>
    </v-data-table>
    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :front-page="true"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="getPodList"
    />
  </div>
</template>

<script lang="ts" setup>
  import { Vector } from '@kubegems/api/typed/prometheus';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import {
    PAI_JOB_NVIDIA_GPU_BY_POD_PROMQL,
    PAI_JOB_NVIDIA_GPU_MEMORY_BY_POD_PROMQL,
    PAI_JOB_USAGE_CPU_BY_POD_PROMQL,
    PAI_JOB_USAGE_MEMORY_BY_POD_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { beautifyCpuUnit, beautifyStorageUnit, sizeOfCpu, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { onUnmounted, reactive, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { NodePod, Region } from '../../../api/region';
  import { useI18n } from '../i18n';

  const props = withDefaults(
    defineProps<{
      region?: Region;
      node?: string;
    }>(),
    {
      region: void 0,
      node: '',
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();

  const headers = [
    { text: i18nLocal.t('table.pod'), value: 'pod', align: 'start' },
    { text: i18nLocal.t('table.sku'), value: 'sku', align: 'start' },
    { text: i18nLocal.t('table.queue'), value: 'queue', align: 'start' },
    { text: i18nLocal.t('table.priority'), value: 'priority', align: 'start' },
    { text: i18nLocal.t('table.tenant'), value: 'tenant', align: 'start' },
    { text: i18nLocal.t('table.creator'), value: 'creator', align: 'start' },
    { text: i18nLocal.t('table.cpu_used'), value: 'cpu', align: 'start' },
    { text: i18nLocal.t('table.memory_used'), value: 'memory', align: 'start' },
    { text: i18nLocal.t('table.gpu_device'), value: 'gpuDevice', align: 'start' },
    { text: i18nLocal.t('table.gpu_used'), value: 'gpu', align: 'start' },
    { text: i18nLocal.t('table.gpu_memory_used'), value: 'gpuMemory', align: 'start' },
  ];

  const state = reactive({
    loading: false,
    refresh: false,
  });

  const pagination = reactive<Pagination<NodePod>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getPodList = async (): Promise<void> => {
    if (!state.refresh) {
      state.loading = true;
      const data = await new Region({ name: props.region.name }).getPodListByRegionNode(props.node, {
        noprocessing: true,
      });
      pagination.items = data;
      pagination.pageCount = Math.ceil(data.length / pagination.size);
      state.loading = false;
    }
    podCPUUsage();
    podMemoryUsage();
    podGPUUsage();
    podGPUMemoryUsage();
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  watch(
    () => props.node,
    (newValue) => {
      if (newValue) {
        pagination.page = 1;
        pagination.size = 10;
        pagination.pageCount = 0;
        pagination.items = [];
        state.refresh = false;
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

  const podCPUUsage = async (): Promise<void> => {
    const podItems = pagination.items.map((item) => {
      return item.name;
    });
    let query = PAI_JOB_USAGE_CPU_BY_POD_PROMQL.replaceAll('$1', podItems.join('|'));
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, {
      query: query,
      noprocessing: true,
    });
    data.forEach((d) => {
      const index = pagination.items.findIndex((pod) => {
        return d.metric.pod === pod.name;
      });
      if (index > -1) {
        const item = pagination.items[index];
        const _now = parseFloat(parseFloat(d?.value[1].toString()).toFixed(2));
        if (item.cpu) {
          const _old = sizeOfCpu(item.cpu, 'core');
          if (_now > _old) {
            item.cpuTrend = 'up';
          } else if (_now < _old) {
            item.cpuTrend = 'down';
          } else {
            item.cpuTrend = 'neutral';
          }
        }
        item.cpu = beautifyCpuUnit(_now * 1000 * 1000 * 1000, 2);
        pagination.items[index] = item;
      }
    });
    pagination.items = pagination.items.slice();
  };

  const podMemoryUsage = async (): Promise<void> => {
    const podItems = pagination.items.map((item) => {
      return item.name;
    });

    let query = PAI_JOB_USAGE_MEMORY_BY_POD_PROMQL.replaceAll('$1', podItems.join('|'));
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, {
      query: query,
      noprocessing: true,
    });
    data.forEach((d) => {
      const index = pagination.items.findIndex((pod) => {
        return d.metric.pod === pod.name;
      });
      if (index > -1) {
        const item = pagination.items[index];
        const _now = parseFloat(parseFloat(d?.value[1].toString()).toFixed(2));
        if (item.memory) {
          const _old = sizeOfStorage(item.memory, 'B');
          if (_now > _old) {
            item.memoryTrend = 'up';
          } else if (_now < _old) {
            item.memoryTrend = 'down';
          } else {
            item.memoryTrend = 'neutral';
          }
        }
        item.memory = beautifyStorageUnit(_now, 2);
        pagination.items[index] = item;
      }
    });
    pagination.items = pagination.items.slice();
  };

  const podGPUUsage = async (): Promise<void> => {
    const podItems = pagination.items.map((item) => {
      return item.name;
    });

    let query = PAI_JOB_NVIDIA_GPU_BY_POD_PROMQL.replaceAll('$1', podItems.join('|'));
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, {
      query: query,
      noprocessing: true,
    });
    data.forEach((d) => {
      const index = pagination.items.findIndex((pod) => {
        return d.metric.pod === pod.name;
      });
      if (index > -1) {
        const item = pagination.items[index];
        if (!item.gpu) {
          item.gpu = {};
        }
        item.gpu[d.metric.device] = parseFloat(d?.value[1].toString());
        pagination.items[index] = item;
      }
    });
    pagination.items = pagination.items.slice();
  };

  const podGPUMemoryUsage = async (): Promise<void> => {
    const podItems = pagination.items.map((item) => {
      return item.name;
    });

    let query = PAI_JOB_NVIDIA_GPU_MEMORY_BY_POD_PROMQL.replaceAll('$1', podItems.join('|'));
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, {
      query: query,
      noprocessing: true,
    });
    data.forEach((d) => {
      const index = pagination.items.findIndex((pod) => {
        return d.metric.pod === pod.name;
      });
      if (index > -1) {
        const item = pagination.items[index];
        if (!item.gpuMemory) {
          item.gpuMemory = {};
        }
        item.gpuMemory[d.metric.device] = parseFloat(d?.value[1].toString()).toFixed(1);
        pagination.items[index] = item;
      }
    });
    pagination.items = pagination.items.slice();
  };

  const getColor = (percentage: number): string => {
    return percentage ? (percentage < 80 ? 'primary' : percentage < 90 ? 'warning' : 'red darken-1') : 'primary';
  };

  const toDetail = (item: NodePod) => {
    let routerName = 'pai-train-detail';
    if (item.queueName === 'im') {
      routerName = 'pai-develop-detail';
    } else if (item.queueName === 'inference') {
      routerName = 'pai-inference-detail';
    }
    window.open(
      router.resolve({
        name: routerName,
        params: {
          tenant: item.tenant,
          region: props.region.name,
          name: item.jobName.replaceAll(`${item.tenant}-`, ''),
        },
      }).href,
    );
  };
</script>

<style lang="scss" scoped>
  .table {
    &__line {
      line-height: 30px;
    }

    &__no {
      margin-top: 3px;
    }

    &__progress {
      height: 22px;
    }
  }
</style>
