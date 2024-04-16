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
  <v-card elevation="0" height="200px">
    <v-card-text>
      <v-row>
        <v-col cols="7">
          <h3 class="text-h6 primary--text">{{ title }}({{ i18n.t('resource.cluster') }})</h3>
          <div class="text-h6 font-weight-regular mt-1">{{ total }}</div>
          <div class="align-center justify-space-between mt-3">
            <FileTip :data-map="dataMap" :type="type">
              <template #trigger>
                <div v-for="(key, index) in top4" :key="index" class="text-body-2">
                  <div class="float-left">
                    <v-avatar class="mr-1" size="10" :style="{ backgroundColor: LINE_THEME_COLORS[index % 10] }">
                      <span class="white--text text-h5" />
                    </v-avatar>
                  </div>
                  <div class="float-left">{{ key }}</div>
                  <div class="float-right">
                    {{ type === 'file' ? beautifyFloatNum(dataMap[key]) : beautifyStorageUnit(dataMap[key]) }}
                  </div>
                  <div class="kubegems__clear-float" />
                </div>
              </template>
            </FileTip>
          </div>
          <div v-if="series.length > 4">...</div>
        </v-col>
        <v-col cols="5">
          <div class="position-relative ml-auto">
            <BasePieChart
              :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
              :extend-height="140"
              :labels="labels"
              :legend="false"
              :metrics="series"
              type="doughnut"
              :unit-type="unitType"
            />
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { LINE_THEME_COLORS } from '@kubegems/libs/constants/chart';
  import { beautifyFloatNum, beautifyStorageUnit } from '@kubegems/libs/utils/helpers';
  import { computed } from 'vue';

  import FileTip from './FileTip.vue';

  const props = withDefaults(
    defineProps<{
      title: string;
      dataMap: { [key: string]: number };
      type: string;
      unitType?: string;
    }>(),
    {
      title: '',
      dataMap: () => {
        return {};
      },
      type: 'file',
      unitType: 'number',
    },
  );

  const store = useStore();
  const i18n = useGlobalI18n();

  const total = computed(() => {
    let t = 0;
    Object.values(props.dataMap || {}).forEach((val) => {
      t += parseInt(val?.toString());
    });
    return props.type === 'file' ? beautifyFloatNum(t) : beautifyStorageUnit(t);
  });

  const labels = computed(() => {
    return Object.keys(props.dataMap || {});
  });
  const series = computed(() => {
    return Object.values(props.dataMap || {}).map((val) => {
      return val || 0;
    });
  });

  const top4 = computed(() => {
    return Object.keys(props.dataMap || {}).slice(0, 4);
  });
</script>

<style lang="scss" scoped>
  .detail {
    position: absolute;
    right: 10px;
    top: 12px;
  }

  .text {
    font-size: 1.6rem;
  }
</style>
