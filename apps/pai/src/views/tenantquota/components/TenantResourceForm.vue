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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-all-inclusive"
    :title="i18nLocal.t('tip.tenant_resource')"
    :width="1200"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('tip.tenant_resource')])" />

        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-autocomplete
                v-model="obj.name"
                color="primary"
                :items="tenantItems"
                :label="i18n.t('resource.tenant')"
                :no-data-text="i18n.t('data.no_data')"
                :readonly="state.edit"
                :rules="objRules.name"
              >
                <template #selection="{ item }">
                  <v-chip color="primary" small>
                    {{ item.text }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.spec.resources.limits.cpu"
                :label="i18nLocal.t('tip.cpu')"
                required
                :rules="objRules.cpu"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.spec.resources.limits.memory"
                :label="i18nLocal.t('tip.memory')"
                required
                :rules="objRules.memory"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.spec.resources.limits['nvidia.com/gpu']"
                :label="i18nLocal.t('tip.gpu')"
                required
                :rules="objRules.gpu"
                type="number"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.spec.resources.limits.storage"
                :label="i18nLocal.t('tip.storage')"
                required
                :rules="objRules.storage"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('table.sku_limit')])" />

        <v-card-text class="pa-2">
          <div>
            <SkuConfig :key="skuKey" ref="skuConfig" :sku-items="skuItemsCopy" />
          </div>
        </v-card-text>
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy, randomString, sizeOfCpu, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { reactive, ref, watch } from 'vue';

  import { Instance } from '../../../api/instance';
  import { Region } from '../../../api/region';
  import { TenantResource } from '../../../api/tenant';
  import { useI18n } from '../i18n';
  import SkuConfig from './SkuConfig.vue';

  const props = withDefaults(
    defineProps<{
      resource?: { cpu: number; memory: number; gpu: number; storage: number };
      skuItems?: Instance[];
    }>(),
    {
      resource: void 0,
      skuItems: () => {
        return [];
      },
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
  });

  const obj = ref<TenantResource>(
    new TenantResource({
      name: '',
      spec: {
        resources: {
          limits: {
            cpu: void 0,
            memory: void 0,
            'nvidia.com/gpu': void 0,
            storage: void 0,
          },
        },
      },
    }),
  );
  const objRules = {
    name: [required],
    cpu: [
      required,
      (v) => !!new RegExp('^\\d+[m]?$').test(v) || i18nLocal.t('ruler.cpu_format_rule'),
      (v) => sizeOfCpu(v) <= sizeOfCpu(props.resource.cpu) || i18nLocal.t('ruler.cpu_max_rule'),
    ],
    memory: [
      required,
      (v) => !!new RegExp('(^\\d+[M|G|T]i$)|(^0$)').test(v) || i18nLocal.t('ruler.memory_format_rule'),
      (v) => sizeOfStorage(v) <= sizeOfStorage(`${props.resource.memory}Gi`) || i18nLocal.t('ruler.memory_max_rule'),
    ],
    gpu: [required, (v) => v <= (props.resource.gpu || 0) || i18nLocal.t('ruler.gpu_max_rule')],
    storage: [
      required,
      (v) => !!new RegExp('(^\\d+[M|G|T]i$)|(^0$)').test(v) || i18nLocal.t('ruler.memory_format_rule'),
      (v) => sizeOfStorage(v) <= sizeOfStorage(`${props.resource.storage}Gi`) || i18nLocal.t('ruler.storage_max_rule'),
    ],
  };

  const tenantItems = ref([]);
  const open = async (): Promise<void> => {
    if (state.edit) {
      const data = await new Region({ name: store.getters.Region().RegionName }).getTenantListInRegion({
        noprocessing: true,
      });
      tenantItems.value = data?.map((t) => {
        return { text: t.name, value: t.name };
      });
    } else {
      const data = store.state.TenantStore;
      tenantItems.value = data?.map((t) => {
        return { text: t.TenantName, value: t.TenantName };
      });
    }

    state.dialog = true;
  };

  const skuItemsCopy = ref([]);
  watch(
    () => props.skuItems,
    (val) => {
      if (val && val.length) skuItemsCopy.value = deepCopy(val);
    },
    { deep: true, immediate: true },
  );

  const skuKey = ref(randomString(6));
  const init = async (item: TenantResource): Promise<void> => {
    skuKey.value = randomString(6);
    state.edit = true;
    const data = deepCopy(item);
    if (!data.spec.resources.limits) {
      data.spec.resources.limits = { cpu: void 0, memory: void 0, 'nvidia.com/gpu': void 0, storage: void 0 };
    }
    obj.value = new TenantResource(data);
    skuItemsCopy.value.forEach((item) => {
      item.limit = -1;
    });
    Object.keys(data.spec.resources.limits || {}).forEach((item) => {
      if (item?.startsWith('sku/')) {
        const skuName = item.split('/')[1];
        const _item = skuItemsCopy.value.find((i) => {
          return i.originalName === skuName;
        });
        _item.limit = data.spec.resources.limits[item];
      }
    });
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);

  const skuConfig = ref(void 0);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      obj.value.region = store.getters.Region().RegionName;
      Object.keys(obj.value.spec.resources.limits).forEach((item) => {
        if (item !== 'cpu' && item !== 'memory' && item !== 'nvidia.com/gpu' && item !== 'storage') {
          delete obj.value.spec.resources.limits[item];
        }
      });
      const limits = skuConfig.value?.getSkuItems();
      limits?.forEach((item) => {
        if (item.limit > -1) {
          obj.value.spec.resources.limits[`sku/${item.originalName}`] = item.limit;
        }
      });
      if (state.edit) {
        await new TenantResource(obj.value).updateTenantResource();
      } else {
        await new TenantResource(obj.value).addTenantResource();
      }
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    state.edit = false;
    form.value.resetValidation();
    obj.value = new TenantResource({
      name: '',
      spec: {
        resources: {
          limits: {
            cpu: void 0,
            memory: void 0,
            'nvidia.com/gpu': void 0,
            storage: void 0,
          },
        },
      },
    });
  };
</script>
