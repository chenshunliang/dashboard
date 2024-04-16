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
  <ClusterGpuInstanceLayout>
    <v-container class="pa-0" fluid>
      <v-card flat>
        <v-card-title class="px-0">
          <BaseFilter1
            :default="{ items: [], text: i18nLocal.t('filter.spec'), value: 'search' }"
            :filters="filters"
            :reload="false"
            @filter="customFilter"
          />
          <v-spacer />
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2 text-center">
                <v-flex>
                  <v-btn color="primary" text @click="addInstance">
                    <v-icon left>mdi-plus-box</v-icon>
                    {{ i18n.t('operate.create_c', [i18nLocal.t('resource.instance')]) }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" text @click="batchOnOrOffLine(true)">
                    <v-icon left>mdi-arrow-up-bold</v-icon>
                    {{ i18nLocal.t('operate.batch_online') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="error" text @click="batchOnOrOffLine(false)">
                    <v-icon left>mdi-arrow-down-bold</v-icon>
                    {{ i18nLocal.t('operate.batch_offline') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-card-title>
        <v-card-text class="px-0">
          <v-data-table
            class="kubegems__table-row-pointer"
            :headers="headers"
            hide-default-footer
            item-key="name"
            :items="pagination.items"
            :items-per-page="pagination.size"
            :no-data-text="i18n.t('data.no_data')"
            :page.sync="pagination.page"
            show-select
            @item-selected="selected"
            @toggle-select-all="toggleSelectAll"
          >
            <template #item.cpu="{ item }"> {{ item.cpu }} vCPU </template>
            <!-- <template #item.cpuMode="{ item }">
              {{ getSkuInfo(item, 'cpu').name.replaceAll('-', ' ') }}
            </template> -->
            <template #item.memory="{ item }">
              {{ getSkuInfo(item, 'memory').resourceQuantity || '-' }}
            </template>
            <!-- <template #item.gpuMode="{ item }">
              {{ getSkuInfo(item, 'gpu').name.replaceAll('-', ' ') }} × {{ getSkuInfo(item, 'gpu').resourceQuantity }}
            </template>
            <template #item.flops="{ item }">
              {{ item.config.flops }}
            </template> -->
            <template #item.enabled="{ item }">
              <span v-if="item.enabled">
                <v-icon color="primary" small> mdi-cart </v-icon>
                {{ i18nLocal.t('operate.online') }}
              </span>
              <span v-else>
                <v-icon color="error" small> mdi-cart-off </v-icon>
                {{ i18nLocal.t('operate.offline') }}
              </span>
            </template>
            <template #item.price="{ item }"> ¥ {{ item.config.price }} </template>
            <template #item.gpuMemory="{ item }"> {{ item.gpuMemory }} </template>
            <template #item.action="{ item, index }">
              <v-flex :id="`r_sku${index}`" />
              <v-menu :attach="`#r_sku${index}`" left>
                <template #activator="{ on }">
                  <v-btn icon>
                    <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                  </v-btn>
                </template>
                <v-card>
                  <v-card-text class="pa-2">
                    <v-flex v-if="!item.enabled">
                      <v-btn color="primary" small text @click="onlineInstance(item)">
                        {{ i18nLocal.t('operate.online') }}
                      </v-btn>
                    </v-flex>
                    <v-flex v-else>
                      <v-btn color="error" small text @click="offlineInstance(item)">
                        {{ i18nLocal.t('operate.offline') }}
                      </v-btn>
                    </v-flex>
                    <v-flex>
                      <v-btn color="primary" small text @click="updateInstance(item)">
                        {{ i18n.t('operate.edit') }}
                      </v-btn>
                    </v-flex>
                    <v-flex>
                      <v-btn color="error" small text @click="removeInstance(item)">
                        {{ i18n.t('operate.delete') }}
                      </v-btn>
                    </v-flex>
                  </v-card-text>
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
            @loaddata="getInstanceList"
          />
        </v-card-text>
      </v-card>

      <AssetForm ref="asset" @refresh="getInstanceList" />
    </v-container>
  </ClusterGpuInstanceLayout>
</template>

<script lang="ts" setup>
  import { convertResponse2List } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { beautifyStorageUnit, deepCopy, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { computed, reactive, ref, watch } from 'vue';

  import { Instance, SkuResource } from '../../api/instance';
  import AssetForm from './components/AssetForm.vue';
  import ClusterGpuInstanceLayout from './components/ClusterGpuInstanceLayout.vue';
  import { useI18n } from './i18n';

  const query = useQuery();
  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const headers = computed(() => {
    const items = [
      { text: i18nLocal.t('table.instance'), value: 'name', align: 'start' },
      { text: i18nLocal.t('table.cpu'), value: 'cpu', align: 'start' },
      { text: i18nLocal.t('table.memory'), value: 'memory', align: 'start' },
      { text: i18nLocal.t('table.cpu_mode'), value: 'cpuMode', align: 'start' },
      { text: i18nLocal.t('table.gpu_mode'), value: 'gpuMode', align: 'start' },
      { text: i18nLocal.t('table.flops'), value: 'flops', align: 'start' },
      { text: i18nLocal.t('table.price'), value: 'price', align: 'start' },
      { text: i18nLocal.t('table.status'), value: 'enabled', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 20 },
    ];
    if (query.value.catalog === 'sGPU') {
      items.splice(5, 0, { text: i18nLocal.t('table.gpu_memory'), value: 'gpuMemory', align: 'start' });
    }
    return items;
  });

  let pagination: Pagination<Instance> = reactive<Pagination<Instance>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });
  const itemsCopy = ref([]);

  const getInstanceList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    if (!query.value.region || !query.value.catalog) return;
    const data = await new Instance({
      region: query.value.region,
    }).getInstanceList({
      page: 1,
      size: 500,
      search: params.search,
      'resource-name': query.value.catalog?.toLocaleLowerCase(),
    });
    const _data = convertResponse2List(data);
    const dd = _data.map((d) => {
      const cpu = getSkuInfo(d, 'cpu').resourceQuantity;
      const cpuMode = getSkuInfo(d, 'cpu').name.replaceAll('-', ' ');
      if (
        !cpuFilter.value.items.some((c) => {
          return c.value === cpuMode;
        })
      )
        cpuFilter.value.items.push({ text: cpuMode, value: cpuMode, parent: 'cpu' });
      const gpuMode =
        query.value.catalog === 'sGPU'
          ? getSkuInfo(d, 'gpu').name.replaceAll('-', ' ')
          : `${getSkuInfo(d, 'gpu').name.replaceAll('-', ' ')} × ${getSkuInfo(d, 'gpu')?.resourceQuantity || ''}`;
      const gpuMemory =
        query.value.catalog === 'sGPU'
          ? `${beautifyStorageUnit(parseInt(getSkuInfo(d, 'gpu')?.resourceQuantity || '0') * 1024 * 1024, 0)}`
          : '';
      const _gpuWithoutCount = getSkuInfo(d, 'gpu').name.replaceAll('-', ' ');
      if (
        !gpuFilter.value.items.some((c) => {
          return c.value === _gpuWithoutCount;
        })
      )
        gpuFilter.value.items.push({ text: _gpuWithoutCount, value: _gpuWithoutCount, parent: 'gpu' });
      const memory = sizeOfStorage(getSkuInfo(d, 'memory').resourceQuantity || '0');
      const price = d.config.price;
      const flops = d.config.flops;
      return new Instance({
        ...d,
        cpu,
        cpuMode,
        gpuMode,
        memory,
        price,
        flops,
        gpuMemory,
      });
    });
    pagination.items = dd;
    itemsCopy.value = dd;
    pagination.pageCount = Math.ceil(dd.length / pagination.size);
  };

  const customFilter = () => {
    let items = itemsCopy.value;
    if (query.value.search) {
      items = items.filter((item) => {
        return item.name && item.name.toLocaleLowerCase().indexOf(query.value.search.toLocaleLowerCase()) > -1;
      });
    }
    if (query.value.cpu) {
      items = items.filter((item) => {
        return item.cpuMode && item.cpuMode.toLocaleLowerCase().indexOf(query.value.cpu.toLocaleLowerCase()) > -1;
      });
    }
    if (query.value.gpu) {
      items = items.filter((item) => {
        return item.gpuMode && item.gpuMode.toLocaleLowerCase().indexOf(query.value.gpu.toLocaleLowerCase()) > -1;
      });
    }
    if (query.value.status) {
      items = items.filter((item) => {
        return item.enabled === (query.value.status === 'online');
      });
    }
    pagination.items = items;
    pagination.pageCount = Math.ceil(pagination.items.length / pagination.size);
  };

  const cpuFilter = ref({ text: i18nLocal.t('filter.cpu'), value: 'cpu', items: [] });
  const gpuFilter = ref({ text: i18nLocal.t('filter.gpu'), value: 'gpu', items: [] });
  const enabledFilter = ref({
    text: i18nLocal.t('filter.status'),
    value: 'status',
    items: [
      {
        text: i18nLocal.t('operate.online'),
        value: 'online',
        parent: 'status',
      },
      {
        text: i18nLocal.t('operate.offline'),
        value: 'offline',
        parent: 'status',
      },
    ],
  });
  const filters = ref([
    { text: i18nLocal.t('filter.spec'), value: 'search', items: [] },
    cpuFilter.value,
    gpuFilter.value,
    enabledFilter.value,
  ]);

  watch(
    () => query.value,
    async (newValue, oldValue) => {
      if (newValue?.region === oldValue?.region && newValue?.catalog === oldValue?.catalog) return;
      pagination.page = 1;
      getInstanceList();
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const getSkuInfo = (item: Instance, type: string): SkuResource => {
    const resource = item.resources.find((r) => {
      return r.resourceName.indexOf(type) > -1;
    });
    return resource ? new SkuResource(resource) : new SkuResource();
  };

  const asset = ref(null);
  const addInstance = (): void => {
    asset.value.open();
  };

  const updateInstance = (item: Instance): void => {
    asset.value.init(item);
    asset.value.open();
  };

  const removeInstance = (item: Instance): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('resource.spec')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('resource.spec')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new Instance(param.item).deleteInstance();
          getInstanceList();
        }
      },
    });
  };

  const onlineInstance = (item: Instance): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.online_c', [i18nLocal.t('resource.spec')]),
      content: {
        text: `${i18nLocal.t('operate.online_c', [i18nLocal.t('resource.spec')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          param.item.enabled = true;
          await new Instance(param.item).updateInstance();
          getInstanceList();
        }
      },
    });
  };

  const offlineInstance = (item: Instance): void => {
    store.commit('SET_CONFIRM', {
      title: i18nLocal.t('operate.offline_c', [i18nLocal.t('resource.spec')]),
      content: {
        text: `${i18nLocal.t('operate.offline_c', [i18nLocal.t('resource.spec')])} ${item.name}`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          param.item.enabled = false;
          await new Instance(param.item).updateInstance();
          getInstanceList();
        }
      },
    });
  };

  const selectedInstanceList = ref<Instance[]>([]);
  const toggleSelectAll = (params: { items: Instance[]; value: boolean }): void => {
    if (params.value) {
      selectedInstanceList.value = deepCopy(params.items);
    } else {
      selectedInstanceList.value = [];
    }
  };
  const selected = (params: { item: Instance; value: boolean }): void => {
    const index = selectedInstanceList.value.findIndex((u) => {
      return u.name === params.item.name;
    });
    if (params.value) {
      if (index === -1) selectedInstanceList.value.push(params.item);
    } else {
      if (index > -1) selectedInstanceList.value.splice(index, 1);
    }
  };

  const batchOnOrOffLine = (online = true): void => {
    if (selectedInstanceList.value.length === 0) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('tip.batch_select_c', [i18nLocal.t('resource.instance')]),
        color: 'warning',
      });
      return;
    }
    const resources: string[] = selectedInstanceList.value.map((c: Instance) => c.name);
    store.commit('SET_CONFIRM', {
      title: online
        ? `${i18n.t('operate.batch')} ${i18nLocal.t('operate.online')} ${i18nLocal.t('resource.instance')}`
        : `${i18n.t('operate.batch')} ${i18nLocal.t('operate.offline')} ${i18nLocal.t('resource.instance')}`,
      content: {
        text: `${resources.join(',')}`,
        type: 'batch_delete',
        one: resources.length === 1 ? resources[0] : undefined,
        status: {},
        tip: online ? `${i18nLocal.t('operate.online')}` : `${i18nLocal.t('operate.offline')}`,
      },
      param: {},
      doFunc: async (): Promise<void> => {
        for (const index in selectedInstanceList.value) {
          const model = selectedInstanceList.value[index];
          try {
            model.enabled = online;
            await new Instance(model).updateInstance();
            store.commit('SET_CONFIRM_STATUS', {
              key: model.name,
              value: true,
            });
          } catch {
            store.commit('SET_CONFIRM_STATUS', {
              key: model.name,
              value: false,
            });
          }
        }
        getInstanceList();
      },
    });
  };
</script>
