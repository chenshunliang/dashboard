<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <BasePanel v-model="state.panel" icon="mdi-speedometer" :title="i18nLocal.t('table.log_rate')" @dispose="dispose">
    <template #action>
      <BaseDatetimePicker v-model="date" color="primary" :default-value="60" @change="datetimeChanged" />
    </template>
    <template #content>
      <div class="d-flex flex-column mt-3 mx-2">
        <BaseAreaChart
          chart-type="line"
          :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
          colorful
          :extend-height="height"
          :global-plugins-check="false"
          label="pod"
          :metrics="metrics"
          :precision="0"
          single-tooptip
          title=""
          type=""
          unit="lines/min"
        />
      </div>
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { ComputedRef, computed, reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import { useStore } from '@/store';
  import { Matrix } from '@/types/prometheus';

  const props = withDefaults(
    defineProps<{
      env?: { clusterName: string; namespace: string };
    }>(),
    {
      env: undefined,
    },
  );

  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    panel: false,
  });

  const date = ref([]);
  const metrics = ref([]);
  const getMatrics = async (): Promise<void> => {
    metrics.value = await new Matrix().getMatrixFromObservabilityByMonitor(props.env.clusterName, props.env.namespace, {
      expr: `sum(gems_loki_logs_count_last_1m{namespace="${props.env.namespace}"})by(container)`,
      start: moment(date.value[0]).utc().format(),
      end: moment(date.value[1]).utc().format(),
    });
  };

  watch(
    () => props.env,
    async (newValue) => {
      if (!newValue) return;
      getMatrics();
    },
    { deep: true, immediate: true },
  );

  const datetimeChanged = () => {
    getMatrics();
  };

  const height: ComputedRef<number> = computed(() => {
    return (window.innerHeight - 64) / 2 + (metrics.value.length / 2) * 20;
  });

  const open = (): void => {
    state.panel = true;
  };
  defineExpose({
    open,
  });

  const emit = defineEmits(['clear']);
  const dispose = (): void => {
    metrics.value = [];
    emit('clear');
  };
</script>
