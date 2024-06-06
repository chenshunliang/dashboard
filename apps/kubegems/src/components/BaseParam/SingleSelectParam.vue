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
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'kubegems__sub_title_bg' : ''"
      :divider="false"
      schema
      :title="label"
    />
    <v-autocomplete
      :id="id"
      class="my-2"
      :hint="param.description || ''"
      :items="items"
      :label="pathLevel === 1 ? '' : labelWithDesc"
      :menu-props="{
        bottom: true,
        left: true,
        origin: `top center`,
        nudgeBottom: param.description ? '24px' : '2px',
      }"
      :no-data-text="i18n.t('data.no_data')"
      :rules="rules"
      :value="param.value || param.default"
      @change="changed($event)"
      @focus="getStorageClassList"
    >
      <template #selection="{ item }">
        <div class="d-flex">
          {{ item['text'] }}
          <div class="text-body-2 ml-2 text--secondary">{{ item['extand'] || '' }}</div>
        </div>
      </template>
      <template #item="{ item }">
        {{ item['text'] }}
        {{ item['extand'] || '' }}
      </template>
    </v-autocomplete>
  </v-flex>
</template>

<script lang="ts" setup>
  import { gatewaySelectData } from '@kubegems/api/direct';
  import { StorageClass } from '@kubegems/api/typed/storageclass';
  import { convertResponse2List } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { ComputedRef, computed, onMounted, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
      clusterName?: string;
      clusterId?: number;
      tenantId?: number;
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
      clusterName: '',
      clusterId: 0,
      tenantId: 0,
    },
  );

  const i18n = useGlobalI18n();

  const labelWithDesc = computed(() => {
    if (props.param.description) {
      return `${props.label}(${props.param.description})`;
    } else {
      return props.label;
    }
  });

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const rules = [];

  const emit = defineEmits(['changeBasicFormParam']);
  const changed = (event: string): void => {
    emit('changeBasicFormParam', props.param, event);
  };

  const items = ref<{ text: string; value: string }[]>([]);
  const getStorageClassList = async (): Promise<void> => {
    if ((props.param.name === 'storageClassName' || props.param.name === 'storageClass') && props.clusterName !== '') {
      const data = await new StorageClass().getStorageClassList(props.clusterName, {
        page: 1,
        size: 1000,
        noprocessing: true,
      });
      items.value = convertResponse2List<StorageClass>(data).map((d) => {
        return { text: d.metadata.name, value: d.metadata.name };
      });
    }
  };

  const getIngressClassNameList = async () => {
    const data: { [key: string]: any } = await gatewaySelectData(props.tenantId, props.clusterId, {
      noprocessing: true,
    });
    items.value = data?.map((d) => {
      return {
        text: d.metadata.name,
        value: d.spec.ingressClass,
        extand: `(ingress class name: ${d.spec.ingressClass})`,
      };
    });
  };

  watch(
    () => props.clusterName,
    async (newValue) => {
      if (!newValue) return;
      if (
        (props.param.name === 'storageClassName' || props.param.name === 'storageClass') &&
        props.clusterName !== ''
      ) {
        getStorageClassList();
      }
      if ((props.param.name === 'ingressClassName' || props.param.name === 'ingressClass') && props.clusterId) {
        getIngressClassNameList();
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    if (props.param.enum && props.param.enum.length > 0) {
      items.value = props.param.enum.map((enumValue) => {
        return { text: enumValue, value: enumValue };
      });
    }
    if ((props.param.name === 'storageClassName' || props.param.name === 'storageClass') && props.clusterName !== '') {
      getStorageClassList();
    }
    if ((props.param.name === 'ingressClassName' || props.param.name === 'ingressClass') && props.clusterId) {
      getIngressClassNameList();
    }

    emit('changeBasicFormParam', props.param, props.param.value || props.param.default);
  });
</script>
