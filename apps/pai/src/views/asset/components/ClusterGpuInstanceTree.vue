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
  <div>
    <v-text-field
      v-model="state.search"
      class="search"
      clearable
      dense
      flat
      hide-details
      :label="i18n.t('query')"
      prepend-inner-icon="mdi-magnify"
      solo
    />
    <v-treeview
      activatable
      :active.sync="state.active"
      color="primary"
      dense
      expand-icon="mdi-chevron-down"
      item-key="treeId"
      :items="treeItems"
      :load-children="loadGpuInstanceTree"
      :open.sync="state.open"
      open-on-click
      return-object
      rounded
      :search="state.search"
      transition
    >
      <template #prepend="{ item }">
        <v-icon v-if="item.type === 'region'" color="primary" left small> mdi-map </v-icon>

        <v-icon v-else color="primary" left small> mdi-expansion-card </v-icon>
      </template>
      <template #label="{ item }">
        <span class="text-body-2">{{ item.name }}</span>
      </template>
    </v-treeview>
  </div>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { onMounted, reactive, ref, watch } from 'vue';

  // import { Instance } from '../../../api/instance';
  import { Region } from '../../../api/region';

  const props = withDefaults(
    defineProps<{
      value: any;
    }>(),
    {
      value: void 0,
    },
  );

  const i18n = useGlobalI18n();
  const query = useQuery();
  const state = reactive({
    active: [],
    open: [],
    search: '',
  });

  const treeItems = ref([]);
  const getRegionList = async (): Promise<void> => {
    const data = await new Region().getRegionList({ noprocessing: true });
    treeItems.value = data.map((item) => ({
      type: 'region',
      treeId: `region-${item.name}`,
      id: item.name,
      name: item.name,
      children: [],
    }));
    defaultActiveByQuery();
  };

  onMounted(() => {
    getRegionList();
  });

  const loadGpuInstanceTree = async (leaf: any): Promise<void> => {
    // const data = await new Instance({ region: leaf.name }).getInstanceResourceList();
    // leaf.children = data.gpu.map((d) => {
    //   return {
    //     type: 'catalog',
    //     treeId: `catalog-${d.name}`,
    //     id: d.name,
    //     name: d.name,
    //     region: leaf.name,
    //   };
    // });
    leaf.children = [
      {
        type: 'catalog',
        treeId: `catalog-GPU`,
        id: '1',
        name: 'GPU',
        region: leaf.name,
      },
      {
        type: 'catalog',
        treeId: `catalog-CPU`,
        id: '2',
        name: 'CPU',
        region: leaf.name,
      },
      {
        type: 'catalog',
        treeId: `catalog-sGPU`,
        id: '3',
        name: 'sGPU',
        region: leaf.name,
      },
    ];
  };

  const emit = defineEmits(['input', 'change']);
  const activeChanged = (value) => {
    const v = value[0];
    emit('input', v);
    emit('change', v);
  };

  const defaultActiveByQuery = async (): Promise<void> => {
    const { region, catalog } = query.value;
    let regionItem = void 0;
    if (region) {
      regionItem = treeItems.value.find((item) => item.name === region);
    } else {
      regionItem = treeItems.value?.length > 0 ? treeItems.value[0] : void 0;
    }
    regionItem && (await loadGpuInstanceTree(regionItem));
    state.open = regionItem ? [regionItem] : [];
    if (state.open.length === 0) {
      return;
    }
    state.active = catalog
      ? [
          {
            type: 'catalog',
            treeId: `catalog-${catalog}`,
          },
        ]
      : [
          {
            type: 'catalog',
            treeId: `catalog-${regionItem.children[0].name}`,
          },
        ];
  };

  watch(
    () => state.active,
    (newValue) => {
      if (props.value !== newValue[0]) {
        activeChanged(newValue);
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>

<style lang="scss" scoped>
  .search {
    padding-top: 6px;
    margin-bottom: 8px;
  }
</style>
