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
  <BasePanel v-model="state.panel" icon="mdi-format-list-text" :title="title" :width="`53%`" @dispose="dispose">
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
        <v-row class="px-3 mt-0">
          <v-col cols="4">
            <v-card class="primary" elevation="0">
              <div class="d-flex align-center px-4 pt-2">
                <v-icon color="white" size="30">{{ iconMap[state.type] }}</v-icon>
                <div class="mx-4">
                  <h4 class="text-h6 white--text"> {{ titleMap[state.type] }} </h4>
                </div>
              </div>
              <div class="px-4 pb-2">
                <div class="d-flex align-center mt-0 white--text">
                  <div class="px-1 py-2 text-h4"> {{ state.files || 0 }} </div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card class="primary" elevation="0">
              <div class="d-flex align-center px-4 pt-2">
                <v-icon color="white" size="30">mdi-file</v-icon>
                <div class="mx-4">
                  <h4 class="text-h6 white--text"> {{ i18nLocal.t('tip.files') }} </h4>
                </div>
              </div>
              <div class="px-4 pb-2">
                <div class="d-flex align-center mt-0 white--text">
                  <div class="px-1 py-2 text-h4"> {{ fileMap ? beautifyFloatNum(fileMap[state.type] || 0) : 0 }}</div>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card class="primary" elevation="0">
              <div class="d-flex align-center px-4 pt-2">
                <v-icon color="white" size="30">mdi-chart-arc</v-icon>
                <div class="mx-4">
                  <h4 class="text-h6 white--text"> {{ i18nLocal.t('tip.capability') }} </h4>
                </div>
              </div>
              <div class="px-4 pb-2">
                <div class="d-flex align-center mt-0 white--text">
                  <div class="px-1 py-2 text-h4">
                    {{ capabilityMap ? beautifyStorageUnit(capabilityMap[state.type] || 0) : 0 }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="px-4 mt-0">
          <v-col cols="3">
            <div :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`">
              <BasePieChart
                v-if="filesByUserLabels.length > 0"
                :extend-height="240"
                :labels="filesByUserLabels"
                :legend="false"
                :metrics="filesByUserSeries"
                :title="`集群下租户${titleMap[state.type]}文件总数`"
                type="doughnut"
                unit-type="number"
              />
            </div>
          </v-col>
          <v-col cols="3">
            <div class="mt-8">
              <div v-for="(item, index) in filesByUserSeries" :key="index" class="text-caption">
                <div class="float-left">
                  <v-avatar class="mr-1" size="10" :style="{ backgroundColor: color[index % 10] }">
                    <span class="white--text text-h5" />
                  </v-avatar>
                </div>
                <div class="float-left">{{ filesByUserLabels[index] }}</div>
                <div class="float-right">{{ beautifyFloatNum(item) }}</div>
                <div class="kubegems__clear-float" />
              </div>
            </div>
          </v-col>
          <v-col cols="3">
            <div :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`">
              <BasePieChart
                v-if="fileCountByUserLabels.length > 0"
                :extend-height="240"
                :labels="fileCountByUserLabels"
                :legend="false"
                :metrics="fileCountByUserSeries"
                :title="`集群下租户${titleMap[state.type]}数量`"
                type="doughnut"
                unit-type="number"
              />
            </div>
          </v-col>
          <v-col cols="3">
            <div class="mt-8">
              <div v-for="(item, index) in fileCountByUserSeries" :key="index" class="text-caption">
                <div class="float-left">
                  <v-avatar class="mr-1" size="10" :style="{ backgroundColor: color[index % 10] }">
                    <span class="white--text text-h5" />
                  </v-avatar>
                </div>
                <div class="float-left">{{ fileCountByUserLabels[index] }}</div>
                <div class="float-right">{{ beautifyFloatNum(item) }}</div>
                <div class="kubegems__clear-float" />
              </div>
            </div>
          </v-col>
          <v-col cols="3">
            <div :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`">
              <BasePieChart
                v-if="capabilityByUserLabels.length > 0"
                :extend-height="240"
                :labels="capabilityByUserLabels"
                :legend="false"
                :metrics="capabilityByUserSeries"
                :title="`集群下租户${titleMap[state.type]}文件容量`"
                type="doughnut"
                unit-type="storage"
              />
            </div>
          </v-col>
          <v-col cols="3">
            <div class="mt-8">
              <div v-for="(item, index) in capabilityByUserSeries" :key="index" class="text-caption">
                <div class="float-left">
                  <v-avatar class="mr-1" size="10" :style="{ backgroundColor: color[index % 10] }">
                    <span class="white--text text-h5" />
                  </v-avatar>
                </div>
                <div class="float-left"> {{ capabilityByUserLabels[index] }}</div>
                <div class="float-right">{{ beautifyStorageUnit(item) }}</div>
                <div class="kubegems__clear-float" />
              </div>
            </div>
          </v-col>
          <v-col cols="3">
            <div :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`">
              <BasePieChart
                v-if="fileTopByUserLabels.length > 0"
                :extend-height="240"
                :labels="fileTopByUserLabels"
                :legend="false"
                :metrics="fileTopByUserSeries"
                :title="`集群${titleMap[state.type]}文件总数Top10`"
                type="doughnut"
                unit-type="number"
              />
            </div>
          </v-col>
          <v-col cols="3">
            <div class="mt-8">
              <div v-for="(item, index) in fileTopByUserSeries" :key="index" class="text-caption">
                <div class="float-left">
                  <v-avatar class="mr-1" size="10" :style="{ backgroundColor: color[index % 10] }">
                    <span class="white--text text-h5" />
                  </v-avatar>
                </div>
                <div class="float-left">{{ fileTopByUserLabels[index] }}</div>
                <div class="float-right"> {{ beautifyFloatNum(item) }}</div>
                <div class="kubegems__clear-float" />
              </div>
            </div>
          </v-col>
          <v-col cols="3">
            <div :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`">
              <BasePieChart
                v-if="capabilityTopByUserLabels.length > 0"
                :extend-height="240"
                :labels="capabilityTopByUserLabels"
                :legend="false"
                :metrics="capabilityTopByUserSeries"
                :title="`集群${titleMap[state.type]}文件容量Top10`"
                type="doughnut"
                unit-type="storage"
              />
            </div>
          </v-col>
          <v-col cols="3">
            <div class="mt-8">
              <div v-for="(item, index) in capabilityTopByUserSeries" :key="index" class="text-caption">
                <div class="float-left">
                  <v-avatar class="mr-1" size="10" :style="{ backgroundColor: color[index % 10] }">
                    <span class="white--text text-h5" />
                  </v-avatar>
                </div>
                <div class="float-left">{{ capabilityTopByUserLabels[index] }}</div>
                <div class="float-right">{{ beautifyStorageUnit(item) }}</div>
                <div class="kubegems__clear-float" />
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import { Vector } from '@kubegems/api/typed/prometheus';
  import { useStore } from '@kubegems/extension/store';
  import { LINE_THEME_COLORS } from '@kubegems/libs/constants/chart';
  import {
    PAI_SET_CAPABILITY_BY_TENANT_PROMQL,
    PAI_SET_COUNT_BY_TENANT_PROMQL,
    PAI_SET_FILES_BY_TENANT_PROMQL,
    PAI_SET_TOP_CAPABILITY_BY_CLUSTER_PROMQL,
    PAI_SET_TOP_FILES_BY_CLUSTER_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { beautifyFloatNum, beautifyStorageUnit } from '@kubegems/libs/utils/helpers';
  import { computed, reactive, ref } from 'vue';

  import { Region } from '../../../../api/region';
  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      fileMap: { workspace: number; dataset: number; modelset: number };
      capabilityMap: { workspace: number; dataset: number; modelset: number };
      region?: Region;
    }>(),
    {
      fileMap: void 0,
      capabilityMap: void 0,
      region: void 0,
    },
  );

  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    panel: false,
    type: '',
    files: 0,
  });

  const color = computed(() => {
    return LINE_THEME_COLORS.map((item) => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(item.replaceAll('var(', '').replaceAll(')', ''))
        ?.trim();
    });
  });

  const titleMap = {
    modelset: i18nLocal.t('tip.modelset'),
    dataset: i18nLocal.t('tip.dataset'),
    workspace: i18nLocal.t('tip.workspace'),
    output: i18nLocal.t('tip.output'),
    codeset: i18nLocal.t('tip.codeset'),
  };

  const iconMap = {
    workspace: 'mdi-home',
    dataset: 'mdi-database',
    modelset: 'mdi-microsoft',
    codeset: 'mdi-code-json',
    output: 'mdi-logout',
  };

  const title = computed(() => {
    return `${props.region?.clusterName || ''} ${titleMap[state.type]}`;
  });

  const open = (): void => {
    state.panel = true;
  };
  const init = (type: string, files: number): void => {
    state.type = type;
    state.files = files;
    getFilesByUserList();
    getFileCountByUserList();
    getCapabilityByUserList();
    getFileTopByUserList();
    getCapabilityTopByUserList();
  };
  defineExpose({
    open,
    init,
  });

  const filesByUserSeries = ref<number[]>([]);
  const filesByUserLabels = ref<string[]>([]);
  const getFilesByUserList = async (): Promise<void> => {
    const query = PAI_SET_FILES_BY_TENANT_PROMQL.replaceAll(
      '$1',
      state.type === 'all' ? 'workspace|modelset|dataset' : state.type,
    ).replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, {
      query: query,
      noprocessing: true,
    });
    filesByUserLabels.value = data.map((d) => {
      return d.metric.tenant || 'all';
    });
    filesByUserSeries.value = data.map((d) => {
      return parseFloat(d.value[1] as string);
    });
  };

  const fileCountByUserSeries = ref<number[]>([]);
  const fileCountByUserLabels = ref<string[]>([]);
  const getFileCountByUserList = async (): Promise<void> => {
    const query = PAI_SET_COUNT_BY_TENANT_PROMQL.replaceAll(
      '$1',
      state.type === 'all' ? 'workspace|modelset|dataset' : state.type,
    ).replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, {
      query: query,
      noprocessing: true,
    });
    fileCountByUserLabels.value = data.map((d) => {
      return d.metric.tenant || 'all';
    });
    fileCountByUserSeries.value = data.map((d) => {
      return parseFloat(d.value[1] as string);
    });
  };

  const capabilityByUserSeries = ref<number[]>([]);
  const capabilityByUserLabels = ref<string[]>([]);
  const getCapabilityByUserList = async (): Promise<void> => {
    const query = PAI_SET_CAPABILITY_BY_TENANT_PROMQL.replaceAll(
      '$1',
      state.type === 'all' ? 'workspace|modelset|dataset' : state.type,
    ).replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, {
      query: query,
      noprocessing: true,
    });
    capabilityByUserLabels.value = data.map((d) => {
      return d.metric.tenant || 'all';
    });
    capabilityByUserSeries.value = data.map((d) => {
      return parseFloat(d.value[1] as string);
    });
  };

  const fileTopByUserSeries = ref<number[]>([]);
  const fileTopByUserLabels = ref<string[]>([]);
  const getFileTopByUserList = async (): Promise<void> => {
    const query = PAI_SET_TOP_FILES_BY_CLUSTER_PROMQL.replaceAll(
      '$1',
      state.type === 'all' ? 'workspace|modelset|dataset' : state.type,
    ).replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, {
      query: query,
      noprocessing: true,
    });
    fileTopByUserLabels.value = data.map((d) => {
      return d.metric.bucket?.replaceAll(`${state.type}-${store.getters.Tenant().TenantName}-`, '');
    });
    fileTopByUserSeries.value = data.map((d) => {
      return parseFloat(d.value[1] as string);
    });
  };

  const capabilityTopByUserSeries = ref<number[]>([]);
  const capabilityTopByUserLabels = ref<string[]>([]);
  const getCapabilityTopByUserList = async (): Promise<void> => {
    const query = PAI_SET_TOP_CAPABILITY_BY_CLUSTER_PROMQL.replaceAll(
      '$1',
      state.type === 'all' ? 'workspace|modelset|dataset' : state.type,
    ).replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, {
      query: query,
      noprocessing: true,
    });
    capabilityTopByUserLabels.value = data.map((d) => {
      return d.metric.bucket?.replaceAll(`${state.type}-${store.getters.Tenant().TenantName}-`, '');
    });
    capabilityTopByUserSeries.value = data.map((d) => {
      return parseFloat(d.value[1] as string);
    });
  };

  const dispose = () => {
    state.panel = false;
    filesByUserSeries.value = [];
    filesByUserLabels.value = [];

    fileCountByUserSeries.value = [];
    fileCountByUserLabels.value = [];

    capabilityByUserSeries.value = [];
    capabilityByUserLabels.value = [];

    fileTopByUserSeries.value = [];
    fileTopByUserLabels.value = [];

    capabilityTopByUserSeries.value = [];
    capabilityTopByUserLabels.value = [];
  };
</script>
