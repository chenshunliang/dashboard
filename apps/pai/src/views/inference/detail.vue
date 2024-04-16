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
  <v-container fluid>
    <BaseRegionHeader />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn color="primary" small text @click="refresh">
            <v-icon small>mdi-refresh</v-icon>
            {{ i18n.t('operate.refresh') }}
          </v-btn>
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex v-if="job.status ? job.config.paused : ''">
                  <v-btn color="primary" small text @click="updateInference">
                    {{ i18n.t('operate.edit') }}
                  </v-btn>
                </v-flex>
                <v-flex v-if="job.status ? job.config.paused : ''">
                  <v-btn color="primary" small text @click="startInference">
                    {{ i18nLocal.t('operate.start') }}
                  </v-btn>
                </v-flex>
                <v-flex v-else>
                  <v-btn color="warning" small text @click="stopInference">
                    {{ i18nLocal.t('operate.stop') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" small text @click="removeInference">
                    {{ i18n.t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <BasicInfo :instance-map="instanceMap" :job="job" />
      </v-col>
      <v-col class="pt-0" cols="10">
        <v-card flat>
          <v-card-text class="pa-0">
            <v-tabs v-model="tab" class="rounded-t pa-3" height="30">
              <v-tab v-for="item in tabItems" :key="item.tab">
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>

        <component :is="tabItems[tab].value" class="mt-3" :instance-map="instanceMap" :job="job" />
      </v-col>
    </v-row>

    <InferenceFrom ref="task" @refresh="getJobDetail" />
  </v-container>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { onMounted, reactive, ref, watch } from 'vue';

  import { Instance } from '../../api/instance';
  import { Job } from '../../api/job';
  // import TrainProcessDAG from '../components/TrainProcessDAG/index.vue';
  import BasicInfo from '../task/components/BasicInfo.vue';
  import EnvList from '../task/components/EnvList.vue';
  import ResourceInfo from '../task/components/ResourceInfo/index.vue';
  import TaskMonitor from '../task/components/TaskMonitor.vue';
  import VolumeList from '../task/components/VolumeList.vue';
  import InferenceFrom from './components/InferenceForm/index.vue';
  import { useI18n } from './i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const routeParams = useParams();
  const store = useStore();
  const router = useRouter();
  const query = useQuery();

  const state = reactive({
    noprocessing: false,
  });

  const tabMap = {
    info: 0,
    monitor: 1,
    env: 2,
    volume: 3,
  };
  const tab = ref(tabMap[query.value.tab] || 0);
  const tabItems = [
    { text: i18nLocal.t('tab.task_info'), value: ResourceInfo, tab: 'info' },
    // { text: i18nLocal.t('tab.train_process'), value: TrainProcessDAG, tab: 'process' },
    { text: i18nLocal.t('tab.task_monitor'), value: TaskMonitor, tab: 'monitor' },
    { text: i18nLocal.t('tab.env'), value: EnvList, tab: 'env' },
    { text: i18nLocal.t('tab.volume'), value: VolumeList, tab: 'volume' },
  ];
  watch(
    () => tab.value,
    () => {
      router.push({
        params: { ...routeParams.value },
        query: {
          ...query.value,
          tab: tabItems[tab.value].tab,
        },
      });
    },
  );

  const job = ref<Job>(new Job());
  const getJobDetail = async () => {
    job.value = await new Job({
      name: routeParams.value.name,
      region: store.getters.Region().RegionName,
      tenant: store.getters.Tenant().TenantName,
    }).getJob({ noprocessing: state.noprocessing });
  };

  const instanceMap = ref<{ [key: string]: Instance }>({});
  const getInstanceList = async () => {
    const data = await new Instance({ region: store.getters.Region().RegionName }).getInstanceInfoList({
      noprocessing: true,
    });
    data.forEach((d) => {
      instanceMap.value[d.name.toLocaleLowerCase()] = d;
    });
  };

  onMounted(async () => {
    await getInstanceList();
    getJobDetail();
  });

  const refresh = () => {
    getJobDetail();
  };

  const task = ref(null);
  const updateInference = (): void => {
    task.value.init(job.value);
    task.value.open();
  };

  const stopInference = (): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.stop_c', [i18nLocal.t('resource.task')]),
      content: {
        text: `${i18nLocal.t('operate.stop_c', [i18nLocal.t('resource.task')])} ${job.value.name}`,
        type: 'confirm',
      },
      param: {},
      doFunc: async () => {
        if (job.value.name.length > 0) {
          await new Job(job.value).stopJob();
          getJobDetail();
        }
      },
    });
  };

  const startInference = (): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.start_c', [i18nLocal.t('resource.task')]),
      content: {
        text: `${i18nLocal.t('operate.start_c', [i18nLocal.t('resource.task')])} ${job.value.name}`,
        type: 'confirm',
      },
      param: {},
      doFunc: async () => {
        if (job.value.name.length > 0) {
          await new Job(job.value).startJob();
          getJobDetail();
        }
      },
    });
  };

  const removeInference = (): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('resource.task')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('resource.task')])} ${job.value.name}`,
        type: 'delete',
        name: job.value.name,
        warning: i18nLocal.t('tip.warn_text'),
      },
      param: {},
      doFunc: async () => {
        if (job.value.name.length > 0) {
          await new Job(job.value).deleteJob();
          router.push({
            name: 'pai-train',
          });
        }
      },
    });
  };
</script>
