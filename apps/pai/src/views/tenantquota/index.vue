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
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <RegionSelect v-model="region" />
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <v-row>
      <v-col cols="2">
        <ResourceCard
          icon="mdi-cpu-64-bit"
          :subtitle="`${resource.cpu || 0} core`"
          :title="i18nLocal.t('tip.total', ['CPU']).toString()"
        />
      </v-col>
      <v-col cols="2">
        <ResourceCard
          icon="mdi-nas"
          :subtitle="`${resource.memory ? resource.memory.toFixed(1) : 0} Gi`"
          :title="i18nLocal.t('tip.total', [i18n.t('resource.memory')]).toString()"
        />
      </v-col>
      <v-col cols="2">
        <ResourceCard
          icon="mdi-expansion-card"
          :subtitle="`${resource.gpu || 0}`"
          :title="i18nLocal.t('tip.total', ['GPU']).toString()"
        />
      </v-col>
      <v-col cols="2">
        <ResourceCard
          icon="mdi-database"
          :subtitle="`${resource.storage || 0} Gi`"
          :title="i18nLocal.t('tip.total', [i18n.t('resource.storage')]).toString()"
        />
      </v-col>
    </v-row>

    <TableForm :region="region" :resource="resource" :sku-items="skuItems" />
  </v-container>
</template>

<script lang="ts" setup>
  import { convertResponse2List } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { sizeOfCpu, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { ref, watch } from 'vue';

  import { Instance } from '../../api/instance';
  import { Region } from '../../api/region';
  import RegionSelect from '../components/RegionSelect.vue';
  import ResourceCard from './components/ResourceCard.vue';
  import TableForm from './components/TableForm.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const resource = ref<{ cpu: number; memory: number; gpu: number; storage: number }>({
    cpu: 0,
    memory: 0,
    gpu: 0,
    storage: 0,
  });

  const getResource = async (): Promise<void> => {
    const data = await new Region({ name: region.value.name }).getRegionCapacity();
    resource.value.cpu = sizeOfCpu(data?.cpu);
    resource.value.memory = sizeOfStorage(data?.memory);
    resource.value.gpu = parseInt(data?.['nvidia.com/gpu']);
    resource.value.storage = sizeOfStorage(data?.storage, 'Gi');
  };

  const skuItems = ref([]);
  const getSkus = async () => {
    const data = await new Instance({
      region: store.getters.Region().RegionName,
    }).getInstanceList({
      page: 1,
      size: 500,
    });
    skuItems.value = convertResponse2List(data).filter((item) => {
      return item.enabled;
    });
  };

  const region = ref<Region>(void 0);
  watch(
    () => region.value,
    (newValue) => {
      if (newValue) {
        resource.value = {
          cpu: 0,
          memory: 0,
          gpu: 0,
          storage: 0,
        };
        getResource();
        getSkus();
      }
    },
    { deep: true, immediate: true },
  );
</script>
