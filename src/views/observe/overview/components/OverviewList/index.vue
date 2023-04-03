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
  <v-card class="pa-4" flat>
    <div class="d-flex justify-space-between align-center">
      <ProjectSelect v-model="project" :tenant="tenant" />
      <Duration v-model="pagination.request.duration" />
    </div>

    <v-data-table
      class="px-2 mt-4"
      disable-sort
      :headers="headers"
      hide-default-footer
      item-key="environmentID"
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :no-results-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
    >
      <template #item.labels="{ item, index }">
        <BaseCollapseChips :id="`o_label_${index}`" :chips="item.labels || {}" icon="mdi-label" single-line />
      </template>
      <template #item.alertLiving="{ item }">
        {{ (item.errorAlertCount || 0) + (item.criticalAlertCount || 0) }}
        <BaseTipChips
          v-if="item.criticalAlertCount || item.errorAlertCount"
          :chips="{ error: item.errorAlertCount, critical: item.criticalAlertCount }"
          :color="item.criticalAlertCount > 0 ? 'error' : 'warning'"
          icon="mdi-fire-alert"
          single-line
          small
        />
        <v-icon color="primary" small @click="toAlertDashboard"> mdi-open-in-new </v-icon>
      </template>
      <template #item.alertRuleCount="{ item }">
        {{ item.alertRuleCount }}
        <BaseTipChips :chips="item.alertResourceMap || {}" color="primary" icon="mdi-ruler" single-line small />
        <v-icon color="primary" small @click="toAlertRule(item)"> mdi-open-in-new </v-icon>
      </template>
      <template #item.monitorCollectorCount="{ item }">
        {{ item.monitorCollectorCount }}
        <v-icon color="primary" small @click="toMetrics(item)"> mdi-open-in-new </v-icon>
      </template>
      <template #item.status="{ item }">
        <StatusTag :item="item" :l="item.logging" :m="item.monitoring" :s="item.serviceMesh" />
      </template>
      <template #item.errorLogCount="{ item }">
        {{ beautyLogCount(item.errorLogCount || 0) }}
        <v-icon color="primary" small @click="showErrorLogRate(item)"> mdi-chart-line </v-icon>
      </template>
      <template #item.logRate="{ item }">
        {{ beautyLogRate(item.logRate || 0) }}
        <v-icon color="primary" small @click="showLogRate(item)"> mdi-chart-line </v-icon>
      </template>
      <template #item.eventCount="{ item }">
        {{ item.eventCount }}
        <v-icon color="primary" small @click="showEvents(item)"> mdi-chart-pie </v-icon>
      </template>
      <template #item.loggingCollectorCount="{ item }">
        {{ item.loggingCollectorCount }}
        <v-icon color="primary" small @click="toLogFlow(item)"> mdi-open-in-new </v-icon>
        <v-menu
          v-if="item.warning"
          bottom
          :close-delay="200"
          :close-on-content-click="false"
          max-width="200px"
          offset-y
          open-on-hover
          origin="top center"
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <span class="kubegems__pointer" v-on="on">
              <v-icon color="error" small> mdi-alert-circle </v-icon>
            </span>
          </template>
          <v-card flat>
            <v-flex class="text-body-2 text-center primary white--text py-2">
              <v-icon color="white" left small> mdi-alert-circle </v-icon>
              <span>{{ i18nLocal.t('tip.error_info') }}</span>
            </v-flex>
            <v-list class="pa-0 kubegems__tip" dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item class="float-left pa-0" two-line>
                    <v-list-item-content class="py-0">
                      <v-list-item-title> {{ i18nLocal.t('tip.error_info') }} </v-list-item-title>
                      <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                        {{ item.warning }}
                      </v-list-item-content>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
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
    />

    <K8sEvents ref="k8sEvents" :env="env" @clear="env = undefined" />
    <LogRateChart ref="logRateChart" :env="env" @clear="env = undefined" />
    <ErrorLogRateChart ref="errorLogRateChart" :env="env" @clear="env = undefined" />
  </v-card>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import Duration from './Duration.vue';
  import ErrorLogRateChart from './ErrorLogRateChart.vue';
  import K8sEvents from './K8sEvents/index.vue';
  import LogRateChart from './LogRateChart.vue';
  import ProjectSelect from './ProjectSelect.vue';
  import StatusTag from './StatusTag.vue';
  import { useEnvironmentListInProject } from '@/composition/project';
  import { useRouter } from '@/composition/router';
  import { useGlobalI18n } from '@/i18n';
  import { Environment } from '@/types/environment';
  import { Project } from '@/types/project';

  withDefaults(
    defineProps<{
      tenant?: { ID: number; TenantName: string };
    }>(),
    {
      tenant: undefined,
    },
  );

  type EnvironmentWithtMetrics = Environment & {
    alertResourceMap: { [key: string]: any };
    alertRuleCount: number;
    clusterName: string;
    containerRestartTotal: number;
    cpu: string;
    criticalAlertCount: number;
    environmentID: number;
    environmentName: string;
    errorAlertCount: number;
    errorLogCount: number;
    eventCount: number;
    labels: { [key: string]: any };
    logRate: string;
    logging: boolean;
    loggingCollectorCount: number;
    memory: string;
    monitorCollectorCount: number;
    monitoring: boolean;
    namespace: string;
    projectID: number;
    projectName: string;
    serviceMesh: boolean;
    warning: string;
  };

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const router = useRouter();

  const headers = [
    { text: i18n.t('resource.environment'), value: 'environmentName', align: 'start' },
    { text: i18nLocal.t('table.label'), value: 'labels', align: 'start' },
    { text: i18nLocal.t('table.status'), value: 'status', align: 'start', width: 250 },
    { text: i18nLocal.t('table.restart_count'), value: 'containerRestartTotal', align: 'start' },
    { text: i18n.t('resource.cpu'), value: 'cpu', align: 'start' },
    { text: i18n.t('resource.memory'), value: 'memory', align: 'start' },
    { text: i18nLocal.t('table.metrics_count'), value: 'monitorCollectorCount', align: 'end', width: 75 },
    { text: i18nLocal.t('table.alert_rule_count'), value: 'alertRuleCount', align: 'end', width: 75 },
    { text: i18nLocal.t('table.living_alert_count'), value: 'alertLiving', align: 'end', width: 75 },
    { text: i18nLocal.t('table.log_count'), value: 'loggingCollectorCount', align: 'end', width: 75 },
    { text: i18nLocal.t('table.error_log_count'), value: 'errorLogCount', align: 'end', width: 75 },
    { text: i18nLocal.t('table.log_rate'), value: 'logRate', align: 'end', width: 130 },
    { text: i18nLocal.t('table.event_count'), value: 'eventCount', align: 'end', width: 100 },
  ];

  let pagination: Pagination<EnvironmentWithtMetrics> = reactive<Pagination<EnvironmentWithtMetrics>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    request: {
      duration: '1h',
    },
  });

  const env = ref(undefined);
  const project = ref<number>(undefined);
  const metrics = ref<EnvironmentWithtMetrics[]>([]);
  const getEnvironmentWithMatrics = async (envId: number): Promise<void> => {
    const data = await new Environment({ ID: envId }).getEnvironmentWithMatrics(pagination.request);
    const index = metrics.value.findIndex((e) => {
      return e.environmentName === data.environmentName;
    });
    if (index > -1) {
      pagination.items.push(data as EnvironmentWithtMetrics);
    }
    pagination.pageCount = Math.ceil(pagination.items.length / pagination.size);
  };

  const environmentItems = ref<Environment[]>([]);
  watch(
    () => project.value,
    async (newValue) => {
      if (!newValue) return;
      metrics.value = [];
      pagination.items = [];
      environmentItems.value = await useEnvironmentListInProject(new Project({ ID: newValue }));
      environmentItems.value.forEach((env) => {
        metrics.value.push({ environmentName: env.EnvironmentName } as EnvironmentWithtMetrics);
        getEnvironmentWithMatrics(env.ID);
      });
    },
    { deep: true },
  );

  watch(
    () => pagination.request.duration,
    async (newValue) => {
      if (!newValue) return;
      metrics.value = [];
      pagination.items = [];
      environmentItems.value.forEach((env) => {
        metrics.value.push({ environmentName: env.EnvironmentName } as EnvironmentWithtMetrics);
        getEnvironmentWithMatrics(env.ID);
      });
    },
    { deep: true },
  );

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const k8sEvents = ref(null);
  const showEvents = (item: EnvironmentWithtMetrics): void => {
    env.value = item;
    k8sEvents.value.open();
  };

  const logRateChart = ref(null);
  const showLogRate = (item: EnvironmentWithtMetrics): void => {
    env.value = item;
    logRateChart.value.open();
  };

  const errorLogRateChart = ref(null);
  const showErrorLogRate = (item: EnvironmentWithtMetrics): void => {
    env.value = item;
    errorLogRateChart.value.open();
  };

  const beautyLogCount = (count: number): string => {
    let result = parseFloat(count.toString());
    const units = ['', 'k', 'm'];
    for (const index in units) {
      if (Math.abs(result) < 1000.0) {
        return `${result.toFixed(1)} ${units[index]}`;
      }
      result /= 1000.0;
    }
    return `${result.toFixed(1)} Yi`;
  };

  const beautyLogRate = (rate: string): string => {
    let result = rate ? parseInt(rate.replaceAll('/min', '')) : 0;
    const resultStr = `${beautyLogCount(result)} /min`;
    return resultStr;
  };

  const toMetrics = (item: EnvironmentWithtMetrics): void => {
    router.push({
      name: 'observe-monitor-config',
      query: {
        proj: item.projectName,
        env: item.environmentName,
        envid: item.environmentID.toString(),
        projid: item.projectID.toString(),
        cluster: item.clusterName,
        namespace: item.namespace,
      },
    });
  };

  const toAlertRule = (item: EnvironmentWithtMetrics): void => {
    router.push({
      name: 'observe-monitor-config',
      query: {
        proj: item.projectName,
        env: item.environmentName,
        envid: item.environmentID.toString(),
        projid: item.projectID.toString(),
        cluster: item.clusterName,
        namespace: item.namespace,
        tab: 'prometheusrule',
      },
    });
  };

  const toLogFlow = (item: EnvironmentWithtMetrics): void => {
    router.push({
      name: 'log-config',
      query: {
        proj: item.projectName,
        env: item.environmentName,
        envid: item.environmentID.toString(),
        projid: item.projectID.toString(),
        cluster: item.clusterName,
        namespace: item.namespace,
      },
    });
  };

  const toAlertDashboard = (): void => {
    router.push({
      name: 'observe-monitor-overview',
    });
  };
</script>
