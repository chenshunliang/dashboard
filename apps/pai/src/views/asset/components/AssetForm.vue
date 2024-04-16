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
    icon="mdi-expansion-card"
    :title="
      state.edit
        ? i18n.t('operate.update_c', [i18nLocal.t('resource.spec')])
        : i18n.t('operate.add_c', [i18nLocal.t('resource.spec')])
    "
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <v-row class="mt-0">
          <v-col v-for="(item, index) in assetItems" :key="index" class="pt-0" cols="4">
            <v-hover #default="{ hover }">
              <v-card
                class="kubegems__pointer asset asset__pos"
                :elevation="hover ? 2 : 0"
                flat
                @click.stop="setAssetType(item.value)"
              >
                <v-list-item three-line>
                  <v-list-item-content>
                    <v-list-item-title class="text-body-2 kubegems__pointer">
                      <div v-for="(icon, index) in item.icon" :key="index" class="float-left">
                        <BaseLogo
                          class="mr-2"
                          :color="store.state.ThemeColor"
                          default-logo="none"
                          :icon-name="icon"
                          :ml="0"
                          :mt="0"
                          :width="24"
                        />
                      </div>
                      <div class="float-left asset__type">
                        {{ item.text }}
                      </div>
                      <div class="kubegems__clear-float" />
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <span class="text-body-2"> {{ item.desc }} </span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <template v-if="assetType === item.value">
                  <v-flex class="asset__watermark-bg" />
                  <v-flex class="asset__watermark font-weight-medium">
                    {{ i18nLocal.t('tip.now_select') }}
                  </v-flex>
                </template>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>

        <BaseSubTitle :title="i18nLocal.t('tip.power_conf')" />
        <v-card-text class="pa-2">
          <v-row>
            <template v-if="assetType !== 'cpu'">
              <v-col id="gpu" cols="6">
                <v-autocomplete
                  v-model="gpu"
                  color="primary"
                  :items="assetType === 'sgpu' ? sgpuSpceItems : gpuSpecItems"
                  :label="i18nLocal.t('tip.gpu_type')"
                  :no-data-text="i18n.t('data.no_data')"
                  :rules="objRules.gpu"
                  @change="gpuChanged"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small>
                      {{ item.text }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-autocomplete
                  v-if="assetType === 'sgpu'"
                  v-model="sgpuMemory"
                  color="primary"
                  :items="sgpuMemoryItems"
                  :label="i18nLocal.t('tip.gpu_memory')"
                  :no-data-text="i18n.t('data.no_data')"
                  :rules="objRules.gpuMemory"
                  :search-input.sync="sgpuMemoryText"
                  :suffix="`${i18nLocal.t('tip.total_gpu_memory')} ${beautifyStorageUnit(
                    parseInt(sgpuObj.resourceQuantity || '0') * 1024 * 1024,
                    0,
                  )}`"
                  @keyup.enter="createSgpuMemory"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small> {{ item.text }} </v-chip>
                  </template>
                </v-autocomplete>
                <v-autocomplete
                  v-else
                  v-model="gpuCore"
                  color="primary"
                  :items="gpuCoreItems"
                  :label="`GPU ${i18nLocal.t('tip.core')}`"
                  :no-data-text="i18n.t('data.no_data')"
                  :rules="objRules.gpuCore"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small> {{ item.text }} </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
            </template>
            <v-col cols="6">
              <v-autocomplete
                v-model="cpu"
                color="primary"
                :items="cpuSpecItems"
                :label="i18nLocal.t('tip.cpu_type')"
                :no-data-text="i18n.t('data.no_data')"
                :rules="objRules.cpu"
              >
                <template #selection="{ item }">
                  <v-chip color="primary" small> {{ item.text }} </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                v-model="cpuSku"
                color="primary"
                :items="cpuSkuItems"
                :label="i18nLocal.t('tip.spec')"
                :no-data-text="i18n.t('data.no_data')"
                :rules="objRules.cpuSpec"
              >
                <template #selection="{ item }">
                  <v-chip color="primary" small> {{ item.text }} </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>
        <BaseSubTitle :title="i18nLocal.t('tip.instance_info_conf')" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="specName"
                :label="i18nLocal.t('tip.name')"
                readonly
                required
                :rules="objRules.name"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="obj.config.flops"
                :label="i18nLocal.t('tip.flops')"
                required
                :rules="objRules.flops"
                suffix="TFLOPS/S"
                type="number"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="obj.config.price"
                :label="i18nLocal.t('tip.price')"
                prefix="¥"
                required
                :rules="objRules.price"
                :suffix="`/${i18nLocal.t('tip.hour')}`"
                type="number"
              />
            </v-col>
          </v-row>
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
  import { useQuery } from '@kubegems/extension/router';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { beautifyStorageUnit, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { ComputedRef, computed, reactive, ref } from 'vue';

  import { Instance, SkuResource } from '../../../api/instance';
  import { useI18n } from '../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const query = useQuery();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
    needGpu: true,
    useSGpu: false,
  });

  const assetType = ref('gpu');
  const assetItems = [
    { text: 'GPU', desc: i18nLocal.t('tip.from_gpu'), value: 'gpu', icon: ['nvidia'] },
    { text: 'CPU', desc: i18nLocal.t('tip.from_cpu'), value: 'cpu', icon: ['intel', 'amd'] },
    { text: i18nLocal.t('tip.share_gpu'), desc: i18nLocal.t('tip.from_sgpu'), value: 'sgpu', icon: ['nvidia'] },
  ];
  const setAssetType = (type: string) => {
    if (!state.edit) assetType.value = type;
  };

  const obj = ref<Instance>(new Instance());
  const objRules = {
    name: [],
    flops: [required, (v) => parseFloat(v) >= 0 || i18nLocal.t('ruler.gt_zero')],
    price: [required, (v) => parseFloat(v) >= 0 || i18nLocal.t('ruler.gt_zero')],
    cpu: [required],
    cpuSpec: [required],
    gpu: [required],
    gpuCore: [required],
    gpuMemory: [
      required,
      (v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || i18nLocal.t('ruler.memory_rule'),
      (v) =>
        !sgpuObj.value.resourceQuantity ||
        sizeOfStorage(v) <= sizeOfStorage(`${sgpuObj.value.resourceQuantity || '0'}Mi`) ||
        i18nLocal.t('ruler.limit_max', [
          beautifyStorageUnit(parseInt(sgpuObj.value.resourceQuantity || '0') * 1024 * 1024, 0),
        ]),
    ],
  };

  const gpuCore = ref(0);
  const gpuCoreItems = computed(() => {
    return Array.from({ length: parseInt(gpuObj.value.resourceQuantity) }, (v, i) => i + 1).map((item) => {
      return { text: `${item} ${i18nLocal.t('tip.core')}`, value: item };
    });
  });

  const SKU_PREFIX_LIST = [
    { sku: '1070', prefix: 'G.1M' },
    { sku: '1080-Ti', prefix: 'G.1Mt' },
    { sku: 'TITAN-X', prefix: 'G.1T' },
    { sku: 'TITAN-Xp', prefix: 'G.1TP' },
    { sku: '2080-Ti', prefix: 'G.2Mt' },
    { sku: '3080-Ti', prefix: 'G.3Mt' },
    { sku: '4080-Ti', prefix: 'G.4Mt' },
    { sku: '3080', prefix: 'G.3M' },
    { sku: '3090', prefix: 'G.3X' },
    { sku: '3070', prefix: 'G.3S' },
    { sku: '4070', prefix: 'G.4S' },
    { sku: '4080', prefix: 'G.4M' },
    { sku: '4090', prefix: 'G.4X' },
    { sku: 'A100', prefix: 'T.A100' },
    { sku: 'A800', prefix: 'T.A800' },
    { sku: 'V100', prefix: 'T.V100' },
    { sku: 'V800', prefix: 'T.V800' },
    { sku: 'P4', prefix: 'T.P4' },
    { sku: 'P100', prefix: 'T.P100' },
    { sku: 'P800', prefix: 'T.P800' },
    { sku: 'H100', prefix: 'T.H100' },
    { sku: 'H800', prefix: 'T.H800' },
    { sku: 'T4', prefix: 'T.T4' },
  ];

  const _cpuSequence = [1, 2, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160];
  const _memorySequence = [
    2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 448, 512, 576, 640, 768, 896,
    1024, 1536, 1920,
  ];
  const generateSkuWithGpu = (): any[] => {
    const result = [];
    const cpuSequence = _cpuSequence.slice(2);
    const memorySequence = _memorySequence.slice(2);
    cpuSequence.forEach((cpu) => {
      memorySequence.forEach((memory) => {
        if (cpu * 20 > memory && cpu < memory) {
          result.push({
            text: `${cpu}${i18nLocal.t('tip.core')} ${memory}Gi`,
            value: `${cpu}C${memory}G`,
            cpu: cpu,
            memory: `${memory}Gi`,
          });
        }
      });
    });
    return result;
  };
  const generateSkuWithoutGpu = (): any[] => {
    const result = [];
    _cpuSequence.forEach((cpu) => {
      _memorySequence.forEach((memory) => {
        if (cpu * 20 > memory && cpu < memory) {
          result.push({
            text: `${cpu}${i18nLocal.t('tip.core')} ${memory}Gi`,
            value: `${cpu}C${memory}G`,
            cpu: cpu,
            memory: `${memory}Gi`,
          });
        }
      });
    });
    return result;
  };

  const cpuSku = ref(void 0);
  const cpuSkuMapItems = computed(() => {
    if (assetType.value === 'gpu') return generateSkuWithGpu();
    else return generateSkuWithoutGpu();
  });
  const cpuSkuItems = computed(() => {
    return cpuSkuMapItems.value.map((item) => {
      if (item.cpu <= parseInt(cpuObj.value.resourceQuantity)) {
        return item;
      }
    });
  });

  const open = (): void => {
    state.dialog = true;
    assetType.value = query.value.catalog.toLocaleLowerCase();
    getResourceItems();
  };
  const init = async (item: Instance): Promise<void> => {
    state.edit = true;
    obj.value = await new Instance(item).getInstance();
    const _cpu = obj.value.resources.find((r) => {
      return r.resourceName.indexOf('cpu') > -1;
    });
    const _gpu = obj.value.resources.find((r) => {
      return r.resourceName.indexOf('gpu') > -1;
    });
    const _memory = obj.value.resources.find((r) => {
      return r.resourceName.indexOf('memory') > -1;
    });
    const _sgpu = obj.value.resources.find((r) => {
      return r.resourceName.indexOf('volcano.sh/vgpu-memory') > -1;
    });
    cpu.value = _cpu?.name;
    cpuSku.value = cpuSkuMapItems.value.find((c) => {
      return c.cpu === parseInt(_cpu?.resourceQuantity || '0') && c.memory === _memory?.resourceQuantity;
    })?.value;
    if (_sgpu) {
      gpu.value = _sgpu?.name;
      sgpuMemory.value = `${parseInt(_sgpu?.resourceQuantity || '0')}Mi`;
      if (
        !sgpuMemoryItems.value.some((m) => {
          return m.value === sgpuMemory.value;
        })
      ) {
        customMemoryItems.value.push({ text: sgpuMemory.value, value: sgpuMemory.value });
      }
      gpuChanged();
    } else if (_gpu) {
      gpu.value = _gpu?.name;
      gpuCore.value = parseInt(_gpu?.resourceQuantity || '0');
      gpuChanged();
    }
  };
  defineExpose({
    open,
    init,
  });

  const cpuObj: ComputedRef<SkuResource> = computed(() => {
    const _cpu = cpuSpecItems.value.find((c) => {
      return c.value === cpu.value;
    });
    return new SkuResource(_cpu?.cpu);
  });
  const gpuObj: ComputedRef<SkuResource> = computed(() => {
    const _gpu = gpuSpecItems.value.find((c) => {
      return c.value === gpu.value;
    });
    return new SkuResource(_gpu?.gpu);
  });
  const sgpuObj: ComputedRef<SkuResource> = computed(() => {
    const _sgpu = sgpuSpceItems.value.find((c) => {
      return c.value === gpu.value;
    });
    return new SkuResource(_sgpu?.sgpu);
  });

  const customMemoryItems = ref([]);
  const sgpuMemoryItems = computed(() => {
    const _pre = parseFloat(sgpuObj.value?.resourceQuantity || '0') / 10;
    if (_pre > 0) {
      return Array.from(Array(10), (v, k) => k)
        .map((item) => {
          return {
            text: `${parseInt(((item + 1) * _pre).toString())}Mi`,
            value: `${parseInt(((item + 1) * _pre).toString())}Mi`,
          };
        })
        .concat(customMemoryItems.value);
    }
    return [].concat(customMemoryItems.value);
  });
  const sgpuMemoryText = ref('');
  const createSgpuMemory = () => {
    if (!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(sgpuMemoryText.value.trim())) {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('ruler.memory_rule'),
        color: 'warning',
      });
      return;
    }
    if (
      !sgpuMemoryItems.value.some((m) => {
        return m.value.toString() === sgpuMemoryText.value.trim();
      })
    ) {
      customMemoryItems.value.push({
        text: sgpuMemoryText.value.trim(),
        value: sgpuMemoryText.value.trim(),
      });
      sgpuMemory.value = sgpuMemoryText.value.trim();
      sgpuMemoryText.value = '';
    }
  };

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      const cpuSpec = cpuSkuMapItems.value.find((c) => {
        return c.value === cpuSku.value;
      });
      obj.value.name = specName.value;
      obj.value.region = query.value.region;
      obj.value.resources = [
        new SkuResource({ ...cpuObj.value, resourceQuantity: cpuSpec.cpu }),
        new SkuResource({ name: 'memory', resourceName: 'memory', resourceQuantity: cpuSpec.memory }),
      ];
      if (assetType.value === 'gpu') {
        obj.value.resources = obj.value.resources.concat([
          new SkuResource({
            ...gpuObj.value,
            resourceQuantity: gpuCore.value,
          }),
        ]);
      } else if (assetType.value === 'sgpu') {
        obj.value.resources = obj.value.resources.concat([
          new SkuResource({
            ...sgpuObj.value,
            resourceQuantity: sizeOfStorage(sgpuMemory.value, 'Mi'),
          }),
          new SkuResource({
            labels: sgpuObj.value.labels,
            name: sgpuObj.value.name,
            resourceName: 'volcano.sh/vgpu-number',
            resourceQuantity: '1',
            resourceRequest: '1',
          }),
        ]);
      }
      if (state.edit) {
        await new Instance(obj.value).updateInstance();
      } else {
        await new Instance(obj.value).addInstance();
      }
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    state.edit = false;
    form.value.resetValidation();
    obj.value = new Instance();
    cpu.value = void 0;
    gpu.value = void 0;
    gpuCore.value = 0;
    sgpuMemory.value = void 0;
    cpuSku.value = void 0;
    prefix.value = '';
    assetType.value = 'gpu';
  };

  const cpu = ref<string>(void 0);
  const cpuSpecItems = ref([]);
  const gpu = ref<string>(void 0);
  const gpuSpecItems = ref([]);
  const sgpuMemory = ref<string>(void 0);
  const sgpuSpceItems = ref([]);
  const getResourceItems = async (gpu: string = void 0): Promise<void> => {
    const data = await new Instance({ region: query.value.region }).getInstanceResourceList(
      gpu ? { 'gpu-name': gpu } : {},
    );
    if (!gpu) {
      gpuSpecItems.value = data.gpu.map((c) => {
        return { text: c.name, value: c.name, gpu: c };
      });
      sgpuSpceItems.value = data?.sgpu?.map((c) => {
        return { text: c.name, value: c.name, sgpu: c };
      });
    }
    cpuSpecItems.value = data.cpu.map((c) => {
      return { text: c.name, value: c.name, cpu: c };
    });
  };

  const prefix = ref('');
  const gpuChanged = (): void => {
    const pr = SKU_PREFIX_LIST.find((pre) => {
      return gpu.value.indexOf(pre.sku) > -1;
    });
    prefix.value = pr?.prefix || '';
    getResourceItems(gpu.value);
  };

  const specName = computed(() => {
    let cpuPrefix = '';
    if (cpu.value) {
      cpuPrefix = cpu.value.indexOf('Intel') > -1 ? 'I' : 'A';
    }
    if (assetType.value === 'gpu') {
      return `${prefix.value}-${gpuCore.value}.${cpuPrefix}.${cpuSku.value || ''}`;
    }
    if (assetType.value === 'sgpu') {
      const _value = sizeOfStorage(sgpuMemory.value);
      const _max = sizeOfStorage(`${sgpuObj.value.resourceQuantity}Mi`);
      const _pre = Math.ceil((_value / _max) * 100).toFixed(0);
      return `${prefix.value}-S${_pre}.${cpuPrefix}.${cpuSku.value || ''}`;
    } else {
      if (cpuPrefix) {
        return `${cpuPrefix}.${cpuSku.value || ''}`;
      }
      return '';
    }
  });
</script>

<style lang="scss" scoped>
  .asset {
    border: 2px solid var(--primary-color);

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 100px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: var(--primary-color);
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 8px;
      right: 4px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }

    &__type {
      line-height: 24px;
    }
  }
</style>

<style scoped>
  .v-list--three-line .v-list-item,
  .v-list-item--three-line {
    min-height: 78px !important;
  }
</style>

<style>
  #gpu .v-input__append-inner label {
    top: 0;
  }
</style>
