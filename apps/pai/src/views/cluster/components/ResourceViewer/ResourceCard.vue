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
  <v-card class="white" elevation="0" height="200px">
    <div class="d-flex align-center px-4 pt-3">
      <v-icon color="primary" size="30">{{ icon }}</v-icon>
      <div class="mx-4">
        <h4 class="text-h6 primary--text"> {{ title }}({{ i18n.t('resource.cluster') }}) </h4>
      </div>
      <v-btn class="detail" color="primary" small text @click="openPanel">
        {{ i18nLocal.t('operate.detail') }}
      </v-btn>
    </div>
    <div class="px-5 py-2">
      <div class="d-flex align-center mt-2 primary--text">
        <div v-if="type !== 'job'" class="pr-4 py-2">
          <h6 class="text-subtitle-2">
            {{ i18nLocal.t('tip.allocated') }}
          </h6>
          <span class="font-weight-medium">{{ allocated.used }}</span>
        </div>
        <template v-else>
          <div class="pr-8 py-2">
            <h6 class="text-subtitle-2">
              {{ i18nLocal.t('tip.modeling') }}
            </h6>
            <span class="font-weight-medium">
              {{ summary && summary.modeling ? summary.modeling.used : 0 }}/{{
                summary && summary.modeling ? summary.modeling.total : 0
              }}
            </span>
          </div>
          <div class="pr-8 py-2">
            <h6 class="text-subtitle-2">
              {{ i18nLocal.t('tip.training') }}
            </h6>
            <span class="font-weight-medium">
              {{ summary && summary.training ? summary.training.used : 0 }}/{{
                summary && summary.training ? summary.training.total : 0
              }}
            </span>
          </div>
          <div class="pr-8 py-2">
            <h6 class="text-subtitle-2">
              {{ i18nLocal.t('tip.inference') }}
            </h6>
            <span class="font-weight-medium">
              {{ summary && summary.inference ? summary.inference.used : 0 }}/{{
                summary && summary.inference ? summary.inference.total : 0
              }}
            </span>
          </div>
        </template>

        <div v-if="type !== 'job'" class="px-3 py-2">
          <h6 class="text-subtitle-2"> {{ i18nLocal.t('tip.total') }} </h6>
          <span class="font-weight-medium">{{ allocated.total }}</span>
        </div>

        <v-spacer />
        <div v-if="type !== 'job'" class="px-3 py-2 text-h4">
          {{ precent }}
        </div>
        <div v-else class="px-3 py-2 text-h4">
          {{ jobTotal }}
        </div>
      </div>

      <BaseAreaChart
        :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
        :extend-height="52"
        :global-plugins-check="false"
        :metrics="chartValues"
        :precision="['job', 'gpu'].indexOf(type) > -1 ? 0 : 2"
        sample
        title=""
        type=""
        :unit="unit"
      />
    </div>

    <ResourcePanel ref="panel" :region="region" />
  </v-card>
</template>

<script lang="ts" setup>
  import { Matrix } from '@kubegems/api/typed/prometheus';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import {
    PAI_JOB_COUNT_BY_CLUSTER_PROMQL,
    PAI_JOB_COUNT_GPU_BY_CLUSTER_PROMQL,
    PAI_JOB_USAGE_CPU_BY_CLUSTER_PROMQL,
    PAI_JOB_USAGE_MEMORY_BY_CLUSTER_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import moment from 'moment';
  import { computed, ref, watch } from 'vue';

  import { Region } from '../../../../api/region';
  import { useI18n } from '../../i18n';
  import ResourcePanel from './ResourcePanel.vue';

  const props = withDefaults(
    defineProps<{
      title: string;
      used: string;
      total: number;
      icon: string;
      type: string;
      summary?: { [key: string]: any };
      region?: Region;
    }>(),
    {
      title: '',
      used: '',
      total: void 0,
      icon: '',
      type: '',
      summary: void 0,
      region: void 0,
    },
  );

  const i18nLocal = useI18n();
  const store = useStore();
  const i18n = useGlobalI18n();

  const panel = ref(null);
  const openPanel = () => {
    panel.value.init(props.type, props.used, props.total);
    panel.value.open();
  };

  const jobTotal = computed(() => {
    if (!props.summary) return 0;
    return (
      parseInt(props.summary.training ? props.summary.training.total : 0) +
      parseInt(props.summary.modeling ? props.summary.modeling.total : 0) +
      parseInt(props.summary.inference ? props.summary.inference.total : 0)
    );
  });

  const precent = computed((): string => {
    if (props.type === 'cpu') {
      return (props.total === 0 ? 0 : (parseFloat(props.used) / props.total) * 100).toFixed(0) + '%';
    }
    if (props.type === 'memory') {
      return (props.total === 0 ? 0 : (parseFloat(props.used) / props.total) * 100).toFixed(0) + '%';
    }
    if (props.type === 'gpu') {
      return (props.total === 0 ? 0 : (parseInt(props.used) / props.total) * 100).toFixed(0) + '%';
    }
    return (props.total === 0 ? 0 : (parseInt(props.used) / props.total) * 100).toFixed(0) + '%';
  });

  const allocated = computed((): any => {
    if (props.type === 'cpu') {
      return { used: `${props.used} core`, total: `${props.total.toFixed(0)} core` };
    }
    if (props.type === 'memory') {
      return { used: `${props.used} Gi`, total: `${props.total.toFixed(0)} Gi` };
    }
    if (props.type === 'gpu') {
      return { used: `${props.used}`, total: `${props.total.toFixed(0)}` };
    }
    return { used: `${props.used}`, total: `${props.total}` };
  });

  const unit = computed(() => {
    if (props.type === 'cpu') return 'core';
    else if (props.type === 'memory') return 'Ki';
    else if (props.type === 'gpu') return '';
    else if (props.type === 'job') return '';
    return '';
  });

  const chartValues = ref([]);
  const getMetrics = async () => {
    let query = '';
    if (props.type === 'gpu') {
      query = PAI_JOB_COUNT_GPU_BY_CLUSTER_PROMQL.replaceAll('%', '');
    } else if (props.type === 'job') {
      query = PAI_JOB_COUNT_BY_CLUSTER_PROMQL.replaceAll('%', '');
    } else if (props.type === 'cpu') {
      query = PAI_JOB_USAGE_CPU_BY_CLUSTER_PROMQL.replaceAll('%', '');
    } else if (props.type === 'memory') {
      query = PAI_JOB_USAGE_MEMORY_BY_CLUSTER_PROMQL.replaceAll('%', '');
    } else {
      return;
    }
    const data = await new Matrix().getMatrix(props.region.clusterName, {
      query: query,
      noprocessing: true,
      start: moment().utc().add(-1, 'days').format(),
      end: moment().utc().format(),
    });
    if (!data?.[0]) return;
    data[0].metric['name'] = 'Used';
    if (props.type === 'gpu') data[0].metric['name'] = 'Allocated';
    else if (props.type === 'job') data[0].metric['name'] = 'Running';
    chartValues.value = data;
  };

  watch(
    () => props.region,
    (newValue) => {
      if (newValue) getMetrics();
    },
    { immediate: true, deep: true },
  );
</script>

<style lang="scss" scoped>
  .title {
    font-size: 28px !important;
    margin-bottom: 10px;
    color: grey !important;
    font-weight: 400;
  }

  .detail {
    position: absolute;
    right: 10px;
    top: 16px;
  }
</style>
