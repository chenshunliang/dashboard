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
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb />
    <v-row class="mt-0">
      <v-col class="pt-0" cols="2">
        <v-card flat>
          <v-card-title class="text-h6 primary--text">
            {{ routeParams.name }}
          </v-card-title>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2">{{ i18n.t('resource.cluster') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                <v-chip v-for="cluster in serviceDiscovery.clusters || []" :key="cluster.name" color="primary" small>
                  {{ i18nLocal.t('tip.cluster_name') }}:{{ cluster.name }} |
                  {{ i18nLocal.t('tip.cluster_check_type') }}:{{ cluster.healthChecker.type }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2">
                {{ i18nLocal.t('tip.protected_threshold') }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">{{ serviceDiscovery.protectThreshold }} </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item two-line>
            <v-list-item-content class="kubegems__text">
              <v-list-item-title class="text-subtitle-2">{{ i18nLocal.t('tip.metadata') }} </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                {{ JSON.stringify(serviceDiscovery.metadata) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
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
        <component :is="tabItems[tab].value" :ref="tabItems[tab].value" class="mt-3" :item="serviceDiscovery" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';

  import InstanceList from './components/InstanceList.vue';
  import { useI18n } from './i18n';
  import { useGlobalI18n } from '@/i18n';
  import { useParams } from '@/router';
  import { useStore } from '@/store';
  import { ServiceDiscovery } from '@/types/nacos';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const routeParams = useParams();
  const store = useStore();

  const tab = ref(0);
  const tabItems = [{ text: i18nLocal.t('tab.instance'), value: InstanceList, tab: 'InstanceList' }];

  const serviceDiscovery = ref<ServiceDiscovery>(new ServiceDiscovery());
  const getService = async (): Promise<void> => {
    serviceDiscovery.value = await new ServiceDiscovery({ serviceName: routeParams.value.name }).getService(
      store.getters.Tenant().TenantName,
      store.getters.Project().ProjectName,
      store.getters.Environment().EnvironmentName,
      {
        serviceName: routeParams.value.name,
      },
    );
  };

  onMounted(() => {
    getService();
  });
</script>
