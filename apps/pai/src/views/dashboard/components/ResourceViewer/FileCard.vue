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
          <h3 class="text-h6 primary--text">{{ title }}</h3>
          <div class="text-h6 font-weight-regular mt-1">{{ total }}</div>
          <div class="d-flex align-center justify-space-between mt-3">
            <span class="d-flex align-center">
              <span class="text-overline">
                <i class="mdi mdi-brightness-1 text-primary mx-1" :style="{ color: LINE_THEME_COLORS[2] }" />
              </span>
              <span class="font-weight-regular text-body-2">
                <v-tooltip nudge-bottom="10px" top>
                  <template #activator="{ on }">
                    <v-icon color="primary" small v-on="on">mdi-microsoft</v-icon>
                  </template>
                  <span>{{ i18nLocal.t('tip.modelset') }}</span>
                </v-tooltip>

                {{ type === 'file' ? beautifyFloatNum(dataMap.modelset) : beautifyStorageUnit(dataMap.modelset) }}
              </span>
            </span>
            <span class="d-flex align-center">
              <span class="text-overline">
                <i class="mdi mdi-brightness-1 text-secondary mx-1" :style="{ color: LINE_THEME_COLORS[1] }" />
              </span>
              <span class="font-weight-regular text-body-2">
                <v-tooltip nudge-bottom="10px" top>
                  <template #activator="{ on }">
                    <v-icon color="primary" small v-on="on">mdi-database</v-icon>
                  </template>
                  <span>{{ i18nLocal.t('tip.dataset') }}</span>
                </v-tooltip>

                {{ type === 'file' ? beautifyFloatNum(dataMap.dataset) : beautifyStorageUnit(dataMap.dataset) }}
              </span>
            </span>
          </div>
          <div class="d-flex align-center justify-space-between">
            <span class="d-flex align-center">
              <span class="text-overline">
                <i class="mdi mdi-brightness-1 text-warning mx-1" :style="{ color: LINE_THEME_COLORS[0] }" />
              </span>
              <span class="font-weight-regular text-body-2">
                <v-tooltip nudge-bottom="10px" top>
                  <template #activator="{ on }">
                    <v-icon color="primary" small v-on="on">mdi-home</v-icon>
                  </template>
                  <span>{{ i18nLocal.t('tip.workspace') }}</span>
                </v-tooltip>

                {{ type === 'file' ? beautifyFloatNum(dataMap.workspace) : beautifyStorageUnit(dataMap.workspace) }}
              </span>
            </span>
          </div>
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
  import { useStore } from '@kubegems/extension/store';
  import { LINE_THEME_COLORS } from '@kubegems/libs/constants/chart';
  import { beautifyFloatNum, beautifyStorageUnit } from '@kubegems/libs/utils/helpers';
  import { computed } from 'vue';

  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      title: string;
      dataMap: { workspace: number; dataset: number; modelset: number };
      type: string;
      unitType?: string;
    }>(),
    {
      title: '',
      dataMap: void 0,
      type: 'file',
      unitType: 'number',
    },
  );

  const store = useStore();

  const total = computed(() => {
    const t =
      parseInt(props.dataMap?.workspace?.toString()) +
      parseInt(props.dataMap?.dataset?.toString()) +
      parseInt(props.dataMap?.modelset?.toString());
    return props.type === 'file' ? beautifyFloatNum(t) : beautifyStorageUnit(t);
  });

  const i18nLocal = useI18n();

  const labels = computed(() => {
    return [
      i18nLocal.t('tip.workspace').toString(),
      i18nLocal.t('tip.dataset').toString(),
      i18nLocal.t('tip.modelset').toString(),
    ];
  });
  const series = computed(() => {
    return [props.dataMap?.workspace || 0, props.dataMap?.dataset || 0, props.dataMap?.modelset || 0];
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
