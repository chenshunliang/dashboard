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
    <BaseViewportHeader />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <div class="float-left provider text-body-2 kubegems__text mr-2">Provider</div>
          <div class="float-left provider__img"><img src="/icon/nacos-t.svg" width="80" /></div>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.service'), value: 'search' }"
          :filters="filters"
        />
        <v-spacer />
        <!-- <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addService">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ i18n.t('operate.create_c', [i18n.t('resource.service')]) }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" text @click="batchDeleteService">
                  <v-icon left>mdi-minus-box</v-icon>
                  {{ i18n.t('operate.delete_c', [i18n.t('resource.service')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu> -->
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="ID"
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
        @item-selected="selected"
        @toggle-select-all="toggleSelectAll"
      >
        <template #item.serviceName="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex" @click.stop="toServiceDiscoveryDetail(item)">
            {{ item.name }}
          </a>
        </template>
        <template #item.clusterCount="{ item }">
          {{ item.clusterCount }}
        </template>
        <template #item.instanceCount="{ item }">
          {{ item.ipCount }}
        </template>
        <template #item.healthInstanceCount="{ item }">
          {{ item.healthyInstanceCount }}
        </template>
        <template #item.protectThreshold="{ item }">
          <span v-if="item.triggerFlag === 'true'">
            <v-icon color="primary" small> mdi-check-circle </v-icon>
            {{ i18nLocal.t('status.enabled') }}
          </span>
          <span v-else>
            <v-icon color="error" small> mid-minus-circle </v-icon>
            {{ i18nLocal.t('status.disabled') }}
          </span>
        </template>
        <template #item.action="{ item }">
          <v-flex :id="`r${item.serviceName}`" />
          <v-menu :attach="`#r${item.serviceName}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <!-- <v-flex>
                  <v-btn color="primary" small text @click="updateService(item)">
                    {{ i18n.t('operate.update') }}
                  </v-btn>
                </v-flex> -->
                <v-flex>
                  <v-btn color="primary" small text @click="viewCodeSample">
                    {{ i18nLocal.t('operate.sdk_demo') }}
                  </v-btn>
                </v-flex>
                <!-- <v-flex>
                  <v-btn color="primary" small text @click="showListener(item)">
                    {{ i18nLocal.t('operate.listen') }}
                  </v-btn>
                </v-flex> -->
                <!-- <v-flex>
                  <v-btn color="error" small text @click="removeService(item)"> {{ i18n.t('operate.delete') }} </v-btn>
                </v-flex> -->
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>
      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getServiceDiscoveryList"
      />
    </v-card>

    <ServiceDiscoveryBaseForm ref="discoveryForm" @refresh="getServiceDiscoveryList" />
    <CodeSDK ref="codeSDK" />
    <ServiceListener ref="listener" />
  </v-container>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';

  import CodeSDK from './components/CodeSDK.vue';
  import ServiceDiscoveryBaseForm from './components/ServiceDiscoveryBaseForm.vue';
  import ServiceListener from './components/ServiceListener.vue';
  import { useI18n } from './i18n';
  import { useServiceDiscoveryList } from '@/composition/nacos';
  import { useRouter } from '@/composition/router';
  import { useGlobalI18n } from '@/i18n';
  import { useParams, useQuery } from '@/router';
  import { useStore } from '@/store';
  import { ServiceDiscovery } from '@/types/nacos';
  import { deepCopy } from '@/utils/helpers';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();
  const routeParams = useParams();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'serviceName', align: 'start' },
    { text: i18nLocal.t('table.group'), value: 'groupName', align: 'start' },
    { text: i18nLocal.t('table.cluster_count'), value: 'clusterCount', align: 'start' },
    { text: i18nLocal.t('table.instance_count'), value: 'instanceCount', align: 'start' },
    { text: i18nLocal.t('table.health_instance_count'), value: 'healthInstanceCount', align: 'start' },
    { text: i18nLocal.t('table.trigger'), value: 'protectThreshold', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<ServiceDiscovery> = reactive<Pagination<ServiceDiscovery>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });

  const getServiceDiscoveryList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<ServiceDiscovery> = await useServiceDiscoveryList(
      new ServiceDiscovery(),
      store.getters.Tenant().TenantName,
      store.getters.Project().ProjectName,
      store.getters.Environment().EnvironmentName,
      params.page,
      params.size,
      { serviceNameParam: params.search },
    );
    pagination = Object.assign(pagination, data);
  };

  const filters = [{ text: i18nLocal.t('filter.service'), value: 'search', items: [] }];

  const query = useQuery();
  watch(
    () => query,
    async (newValue) => {
      if (!newValue) return;
      if (newValue.value.search) {
        pagination.search = newValue.value.search;
      } else {
        pagination.search = '';
      }
      getServiceDiscoveryList();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const discoveryForm = ref(null);
  const addService = (): void => {
    discoveryForm.value.open();
  };

  const updateService = (item: ServiceDiscovery): void => {
    discoveryForm.value.init(item);
    discoveryForm.value.open();
  };

  const removeService = async (item: ServiceDiscovery): Promise<void> => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.service')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.service')])} ${item.serviceName}`,
        type: 'delete',
        name: item.serviceName,
      },
      param: { item },
      doFunc: async (param) => {
        await new ServiceDiscovery(param.item).deleteService();
        getServiceDiscoveryList();
      },
    });
  };

  const selectedServiceList = ref<ServiceDiscovery[]>([]);
  const toggleSelectAll = (params: { items: ServiceDiscovery[]; value: boolean }): void => {
    if (params.value) {
      selectedServiceList.value = deepCopy(params.items);
    } else {
      selectedServiceList.value = [];
    }
  };
  const selected = (params: { item: ServiceDiscovery; value: boolean }): void => {
    const index = selectedServiceList.value.findIndex((u) => {
      return u.serviceName === params.item.serviceName;
    });
    if (params.value) {
      if (index === -1) selectedServiceList.value.push(params.item);
    } else {
      if (index > -1) selectedServiceList.value.splice(index, 1);
    }
  };

  const batchDeleteService = (): void => {
    if (selectedServiceList.value.length === 0) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.batch_select_c', [i18n.t('resource.service')]),
        color: 'warning',
      });
      return;
    }
    const resources: string[] = selectedServiceList.value.map((c: ServiceDiscovery) => c.serviceName);
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.batch_delete_c', [i18n.t('resource.account')]),
      content: {
        text: resources.join(','),
        type: 'batch_delete',
        one: resources.length === 1 ? resources[0] : undefined,
        status: {},
      },
      param: {},
      doFunc: async (): Promise<void> => {
        for (const index in selectedServiceList.value) {
          const service = selectedServiceList.value[index];
          try {
            await new ServiceDiscovery(service).deleteService();
            store.commit('SET_CONFIRM_STATUS', {
              key: service.serviceName,
              value: true,
            });
          } catch {
            store.commit('SET_CONFIRM_STATUS', {
              key: service.serviceName,
              value: false,
            });
          }
        }
        getServiceDiscoveryList();
      },
    });
  };

  const codeSDK = ref(null);
  const viewCodeSample = (): void => {
    codeSDK.value.open();
  };

  const listener = ref(null);
  const showListener = (item: ServiceDiscovery): void => {
    listener.value.init(item);
    listener.value.open();
  };

  const toServiceDiscoveryDetail = (item: ServiceDiscovery) => {
    router.push({
      name: 'app-discovery-detail',
      params: {
        name: item.name,
        ...routeParams.value,
      },
    });
  };
</script>

<style lang="scss" scoped>
  .provider {
    line-height: 64px;
    font-weight: bold !important;

    &__img {
      // margin-right: 120px;
      margin-top: 23px;
    }
  }

  .conf__menu {
    right: 10px !important;
    left: auto !important;
  }
</style>
