<!--
 * xiaoshi
 * Copyright (C) 2024  xiaoshiai.cn
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
  <div :style="{ height: `${extendHeight}px`, position: 'relative', width: '100%' }">
    <canvas :id="chartId" />
  </div>
</template>

<script lang="ts" setup>
  import { LINE_THEME_COLORS, LINE_THEME_FUL_COLORS } from '@kubegems/libs/constants/chart';
  import { beautifyTime, randomString } from '@kubegems/libs/utils/helpers';
  import Chart, { ScatterDataPoint } from 'chart.js/auto';
  import ChartDataLabels from 'chartjs-plugin-datalabels';
  import { nextTick, onMounted, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      color?: string[];
      extendHeight?: number;
      labels?: string[];
      labelShow?: boolean;
      metrics?: any[];
      title?: string;
      horizontal?: boolean;
      type?: string;
      yDisplay?: boolean;
    }>(),
    {
      id: '',
      color: undefined,
      extendHeight: 280,
      labels: undefined,
      labelShow: true,
      metrics: undefined,
      title: '',
      horizontal: false,
      type: '',
      yDisplay: true,
    },
  );

  const chart = ref<any>(undefined);
  const chartId = ref<string>('');

  const loadChart = (): void => {
    if (!chart.value) {
      const ctx = (document.getElementById(chartId.value) as HTMLCanvasElement).getContext('2d');
      chart.value = new Chart(
        ctx as any,
        {
          type: 'bar',
          plugins: [ChartDataLabels],
          data: {
            labels: props.labels,
            datasets: loadDatasets(),
          },
          options: {
            indexAxis: props.horizontal ? 'y' : 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                align: 'start',
                display: true,
                text: props.title,
                font: {
                  weight: 'normal',
                  lineHeight: '32px',
                  size: 14,
                },
                color: 'rgba(0, 0, 0, 0.87)',
              },
              legend: {
                display: props.labelShow,
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  pointStyleWidth: 10,
                  boxHeight: 7,
                },
              },
              tooltip: {
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 4,
                mode: 'index',
                callbacks: {
                  label: (tooltipItem) => {
                    return props.horizontal
                      ? props.type === 'time'
                        ? beautifyTime(
                            (tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).x?.toString(),
                            1000000,
                          )
                        : (tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).x?.toFixed(1)
                      : (tooltipItem.dataset.data[tooltipItem.dataIndex] as ScatterDataPoint).y?.toString();
                  },
                },
              },
              datalabels: {
                color: 'rgba(0,0,0,0.87)',
                align: 'right',
                anchor: 'end',
                display: (context) => {
                  if (!props.horizontal) return false;
                  return context.dataset.data[context.dataIndex] !== null ? 'auto' : false;
                },
                formatter: (value, context) => {
                  return props.horizontal
                    ? props.type === 'time'
                      ? (context.dataset.data[context.dataIndex] as ScatterDataPoint).x /
                          (context.dataset.data[0] as ScatterDataPoint).x <
                        0.3
                        ? `${value.y}  ${beautifyTime(value.x, 1000000)}`
                        : beautifyTime(value.x, 1000000)
                      : (context.dataset.data[context.dataIndex] as ScatterDataPoint).x /
                          (context.dataset.data[0] as ScatterDataPoint).x <
                        0.3
                      ? `${value.y}  ${value.x.toFixed(1)}`
                      : value.x.toFixed(1)
                    : value.y;
                },
              },
            },
            radius: 0,
            borderWidth: 1,
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                display: props.yDisplay,
                grid: {
                  borderDash: [8, 8, 8],
                  drawBorder: false,
                },
                ticks: {
                  maxTicksLimit: props.horizontal ? 20 : 8,
                },
              },
            },
          },
        } as any,
      );
    } else {
      chart.value.data = { datasets: loadDatasets() };
      chart.value.update('none');
    }
  };

  const loadDatasets = (): any[] => {
    const datasets = props.metrics?.map((m, index) => {
      return {
        label: m.label || '',
        data: m.data,
        borderColor: props.color?.length > 0 ? props.color[index % props.color.length] : LINE_THEME_COLORS[index % 10],
        backgroundColor:
          props.color?.length > 0 ? props.color[index % props.color.length] : LINE_THEME_FUL_COLORS[index % 10],
        datalabels: {
          labels: {
            name: {
              align: (context) => {
                return context.dataset.data[context.dataIndex].x / context.dataset.data[0].x < 0.3 ? 'left' : 'right';
              },
              anchor: 'start',
              color: (context) => {
                return context.dataset.data[context.dataIndex].x / context.dataset.data[0].x < 0.3
                  ? 'grey'
                  : 'rgba(0,0,0,0.87)';
              },
              formatter: function (value) {
                return value.y;
              },
            },
            value: {},
          },
        },
      };
    });

    return datasets;
  };

  onMounted(() => {
    nextTick(() => {
      if (props.id) {
        chartId.value = props.id;
      } else {
        chartId.value = randomString(6);
      }
      const interval = setInterval(() => {
        if (document.getElementById(chartId.value)) {
          clearInterval(interval);
          loadChart();
        }
      }, 300);
    });
  });

  watch(
    () => props.metrics,
    async (newValue) => {
      if (newValue && newValue?.length >= 0 && document.getElementById(chartId.value)) {
        loadChart();
      }
    },
    { deep: true },
  );
</script>
