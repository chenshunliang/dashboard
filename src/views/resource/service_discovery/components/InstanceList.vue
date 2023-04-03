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
  <v-card>
    <v-card-text>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.name="{ item }">
          {{ item.metadata.name }}
        </template>
      </v-data-table>
      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getInstanceList"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, watch } from 'vue';

  import messages, { useI18n } from '../i18n';
  import { getIngressList } from '@/api';
  import { useServiceInstanceList } from '@/composition/nacos';
  import { useGlobalI18n } from '@/i18n';
  import BaseResource from '@/mixins/resource';
  import { useParams } from '@/router';
  import { useStore } from '@/store';
  import { convertResponse2Pagination } from '@/types/base';
  import { ServiceDiscovery, ServiceInstance } from '@/types/nacos';

  const props = withDefaults(
    defineProps<{
      item?: ServiceDiscovery;
    }>(),
    {
      item: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const routeParams = useParams();

  const headers = [
    { text: 'IP', value: 'ip', align: 'start' },
    { text: i18nLocal.t('table.port'), value: 'port', align: 'start' },
    { text: i18nLocal.t('table.weight'), value: 'weight', align: 'start' },
    { text: i18nLocal.t('table.ephemeral'), value: 'ephemeral', align: 'start' },
    { text: i18nLocal.t('table.healthy'), value: 'healthy', align: 'start' },
    { text: i18nLocal.t('table.metadata'), value: 'metadata', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<ServiceInstance> = reactive<Pagination<ServiceInstance>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });

  const getInstanceList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    await useServiceInstanceList(
      new ServiceInstance({ serviceName: routeParams.value.name }),
      store.getters.Tenant().TenantName,
      store.getters.Project().ProjectName,
      store.getters.Environment().EnvironmentName,
      params.page,
      params.size,
      { serviceName: routeParams.value.name },
    );
  };

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      getInstanceList();
    },
    {
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
</script>
