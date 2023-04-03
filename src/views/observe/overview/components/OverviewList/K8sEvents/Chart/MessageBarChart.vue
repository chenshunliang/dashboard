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
  <BaseBarChart
    :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
    :color="['#26C6DA', '#FB8C00']"
    height="290px"
    :metrics="series"
  />
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { ref, watch } from 'vue';

  import { useParams } from '@/router';
  import { useStore } from '@/store';

  const props = withDefaults(
    defineProps<{
      date?: any[];
      data?: any[];
    }>(),
    {
      date: undefined,
      data: undefined,
    },
  );

  const store = useStore();
  const routeParams = useParams();

  const generateDateArray = () => {
    const timeStep = (props.date[1] - props.date[0]) / 10;
    return '0123456789'
      .split('')
      .concat(['10'])
      .map((s) => {
        return props.date[0] + timeStep * parseFloat(s);
      });
  };

  const series = ref([]);
  const loadSeries = (data, timeArray) => {
    const metrics = [];
    const types = ['Normal', 'Warning'];
    types.forEach((severity) => {
      metrics.push({
        metric: { name: severity },
        values: timeArray.map((d) => {
          return [d, 0];
        }),
      });
    });
    data.forEach((d) => {
      const time = Date.parse(moment(d.stream.lastTimestamp as any) as any);
      const index = timeArray.findIndex((t) => {
        return t >= time;
      });
      if (index > -1) {
        if (d.stream.type === 'Normal') {
          metrics[0].values[index][1] += 1;
        } else if (d.stream.type === 'Warning') {
          metrics[1].values[index][1] += 1;
        }
      }
    });
    series.value = metrics.map((metricAndValues) => {
      return {
        label:
          metricAndValues.metric && JSON.stringify(metricAndValues.metric) !== '{}'
            ? Object.values(metricAndValues.metric)[0]
            : routeParams.value.name,
        data: metricAndValues.values.map((v) => {
          return { x: moment(new Date(v[0])).format('LTS'), y: v[1] };
        }),
      };
    });
  };

  watch(
    () => props.data,
    async (newValue) => {
      if (!newValue) return;
      const timeArray = generateDateArray();
      loadSeries(newValue, timeArray);
    },
    { deep: true, immediate: true },
  );
</script>
