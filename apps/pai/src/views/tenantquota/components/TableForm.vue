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
  <v-card class="mt-3">
    <v-data-table
      class="mx-4 pb-4"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="items"
      :items-per-page="1000"
      :no-data-text="i18n.t('data.no_data')"
      :page="1"
    >
      <template #top>
        <v-card-title class="px-0 mb-0 pb-0">
          <v-spacer />
          <v-spacer />
          <v-spacer />
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="primary" text @click="addTenantResource">
                    <v-icon left>mdi-plus-box</v-icon>
                    {{ i18n.t('operate.create_c', [i18nLocal.t('tip.tenant_resource')]) }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-card-title>
      </template>

      <template #item.cpu="{ item }">
        {{ item.spec.resources.limits ? item.spec.resources.limits.cpu : '-' }}
      </template>

      <template #item.gpu="{ item }">
        {{ item.spec.resources.limits ? item.spec.resources.limits['nvidia.com/gpu'] : '-' }}
      </template>

      <template #item.memory="{ item }">
        {{ item.spec.resources.limits ? item.spec.resources.limits.memory : '-' }}
      </template>

      <template #item.storage="{ item }">
        {{ item.spec.resources.limits ? item.spec.resources.limits.storage : '-' }}
      </template>

      <template #item.skuLimits="{ item }">
        <v-chip v-for="(value, sku) in getSkuLimits(item)" :key="sku" class="ma-1" color="primary" small>
          {{ sku }} * {{ value }}
        </v-chip>
      </template>

      <template #item.action="{ item, index }">
        <v-flex :id="`r-queue${index}`" />
        <v-menu :attach="`#r-queue${index}`" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" small text @click="updateTenantResource(item)">
                  {{ i18n.t('operate.edit') }}
                </v-btn>
              </v-flex>
              <v-flex>
                <v-btn color="error" small text @click="removeTenantResource(item)">
                  {{ i18n.t('operate.delete') }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
      <template #item.type="{ item }">
        {{ typeMap[item.name] || i18nLocal.t('tip.training') }}
      </template>
    </v-data-table>

    <TenantResourceForm
      ref="tenantResource"
      :region="region"
      :resource="resource"
      :sku-items="skuItems"
      @refresh="getTenantResourceList"
    />
  </v-card>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { Instance } from '../../../api/instance';
  import { Region } from '../../../api/region';
  import { TenantResource } from '../../../api/tenant';
  import { usePreCheck } from '../../../hooks/precheck';
  import { useI18n } from '../i18n';
  import TenantResourceForm from './TenantResourceForm.vue';

  const props = withDefaults(
    defineProps<{
      resource?: { cpu: number; memory: number; gpu: number; storage: number };
      region?: Region;
      skuItems?: Instance[];
    }>(),
    {
      resource: void 0,
      region: void 0,
      skuItems: () => {
        return [];
      },
    },
  );

  const i18n = useGlobalI18n();
  const store = useStore();
  const i18nLocal = useI18n();

  const typeMap = {
    im: i18nLocal.t('tip.im'),
    inference: i18nLocal.t('tip.inference'),
  };

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.type'), value: 'type', align: 'start' },
    // { text: i18nLocal.t('table.weight'), value: 'weight', align: 'start', width: '200px' },
    { text: i18nLocal.t('table.gpu'), value: 'gpu', align: 'start' },
    { text: i18nLocal.t('table.cpu'), value: 'cpu', align: 'start' },
    { text: i18nLocal.t('table.memory'), value: 'memory', align: 'start' },
    { text: i18nLocal.t('table.storage'), value: 'storage', align: 'start' },
    { text: i18nLocal.t('table.sku_limit'), value: 'skuLimits', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  const params = reactive({
    noprocessing: false,
  });
  const items = ref<TenantResource[]>([]);
  const getTenantResourceList = async (): Promise<void> => {
    const data = await new TenantResource({ region: props.region.name }).getTenantResourceList({
      noprocessing: params.noprocessing,
    });
    items.value = data;
  };

  const getSkuLimits = (item: TenantResource) => {
    const limits = deepCopy(item.spec?.resources?.limits || {});
    delete limits.cpu;
    delete limits.memory;
    delete limits.storage;
    delete limits['nvidia.com/gpu'];
    return limits;
  };

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  watch(
    () => props.region,
    (newValue) => {
      if (newValue) {
        if (!usePreCheck()) return;
        const { cancel } = useRequest(getTenantResourceList, {
          pollingInterval: 1000 * 30,
          onSuccess: () => {
            params.noprocessing = true;
          },
        });
        _cancel = cancel;
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  onUnmounted(() => {
    if (_cancel) _cancel();
  });

  const tenantResource = ref(null);
  const addTenantResource = (): void => {
    tenantResource.value.open();
  };

  const updateTenantResource = (item: TenantResource): void => {
    tenantResource.value.init(item);
    tenantResource.value.open();
  };

  const removeTenantResource = (item: TenantResource): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('tip.tenant_resource')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('tip.tenant_resource')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new TenantResource(param.item).deleteTenantResource();
          getTenantResourceList();
        }
      },
    });
  };
</script>
