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
  <v-data-table
    v-model="selected"
    class="px-4 pt-4 rounded table"
    dense
    :footer-props="{
      'items-per-page-options': [10, 20],
      'items-per-page-text': i18nLocal.t('tip.per_page'),
    }"
    :headers="headers"
    item-key="name"
    :items="filterInstanceItems"
    :items-per-page="10"
    :no-data-text="i18n.t('data.no_data')"
    :no-results-text="i18n.t('data.no_data')"
    show-select
    single-select
    :sort-by="['gpuMode']"
    @item-selected="instanceSelected"
  >
    <template #top>
      <div class="mb-2 kubegems__relative">
        <v-btn class="refresh" color="primary" icon small @click="refresh">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <div>
          <div class="mr-2 filter__label text-body-2 float-left">{{ i18nLocal.t('tip.typed') }}</div>
          <div class="select">
            <div
              :class="`select__title rounded-t ${filterType === 'cpu' ? 'primary white--text' : 'white'}`"
              @click="setFilterType('cpu')"
            >
              <v-icon :color="filterType === 'cpu' ? 'white' : 'primary'" left>mdi-cpu-64-bit</v-icon>
              CPU
            </div>
            <div class="rounded">
              <v-select
                v-model="typed"
                dense
                disable-lookup
                flat
                hide-details
                :items="typedItems"
                solo
                @change="typedChanged"
              >
                <template #selection="{ item }">
                  <div class="kubegems__full-center text-body-2">{{ item.text }}</div>
                </template>
                <template #item="{ item }">
                  <div class="kubegems__full-center text-body-2">{{ item.text }}</div>
                </template>
              </v-select>
            </div>
          </div>
          <div class="select">
            <div
              :class="`select__title rounded-t ${filterType === 'gpu' ? 'primary white--text' : 'white'}`"
              @click="setFilterType('gpu')"
            >
              <v-icon :color="filterType === 'gpu' ? 'white' : 'primary'" left>mdi-expansion-card</v-icon>
              GPU
            </div>
            <div class="rounded">
              <v-select
                v-model="named"
                dense
                disable-lookup
                flat
                hide-details
                :items="namedItems"
                solo
                @change="namedChanged"
              >
                <template #selection="{ item }">
                  <div :class="`kubegems__full-center text-body-2 ${item.icon ? 'select__item' : ''}`">
                    <div v-if="item.icon" class="float-left">
                      <BaseLogo class="mr-2" :icon-name="item.icon" :ml="0" :mt="1" :width="20" />
                    </div>
                    <div class="float-left select__item__content">
                      {{ item.text }}
                    </div>
                    <div class="kubegems__clear-float" />
                  </div>
                </template>
                <template #item="{ item }">
                  <div :class="`kubegems__full-center text-body-2 ${item.icon ? 'select__item' : ''}`">
                    <div v-if="item.icon" class="float-left">
                      <BaseLogo class="mr-2" :icon-name="item.icon" :ml="0" :mt="1" :width="20" />
                    </div>
                    <div class="float-left select__item__content">
                      {{ item.text }}
                    </div>
                    <div class="kubegems__clear-float" />
                  </div>
                </template>
              </v-select>
            </div>
          </div>
          <div class="select">
            <div
              :class="`select__title rounded-t ${filterType === 'sgpu' ? 'primary white--text' : 'white'}`"
              @click="setFilterType('sgpu')"
            >
              <v-icon :color="filterType === 'sgpu' ? 'white' : 'primary'" left>mdi-expansion-card</v-icon>
              {{ i18nLocal.t('tip.share_gpu') }}
            </div>
            <div class="rounded">
              <v-select
                v-model="sgpud"
                dense
                disable-lookup
                flat
                hide-details
                :items="namedItems"
                solo
                @change="sgpudChanged"
              >
                <template #selection="{ item }">
                  <div :class="`kubegems__full-center text-body-2 ${item.icon ? 'select__item' : ''}`">
                    <div v-if="item.icon" class="float-left">
                      <BaseLogo class="mr-2" :icon-name="item.icon" :ml="0" :mt="1" :width="20" />
                    </div>
                    <div class="float-left select__item__content">
                      {{ item.text }}
                    </div>
                    <div class="kubegems__clear-float" />
                  </div>
                </template>
                <template #item="{ item }">
                  <div :class="`kubegems__full-center text-body-2 ${item.icon ? 'select__item' : ''}`">
                    <div v-if="item.icon" class="float-left">
                      <BaseLogo class="mr-2" :icon-name="item.icon" :ml="0" :mt="1" :width="20" />
                    </div>
                    <div class="float-left select__item__content">
                      {{ item.text }}
                    </div>
                    <div class="kubegems__clear-float" />
                  </div>
                </template>
              </v-select>
            </div>
          </div>
          <div class="kubegems__clear-float" />
        </div>
      </div>
    </template>
    <template #item.name="{ item }">
      {{ item.name }}
      <div v-if="!item.onSale">
        <v-chip class="lighten-1" color="orange" label x-small>{{ i18nLocal.t('tip.soldout') }}</v-chip>
      </div>
    </template>
    <template #item.cpu="{ item }">
      {{ item.cpu }} vCPU
      <div v-if="!item.onSale">
        <v-chip class="lighten-1" color="orange" label x-small>{{ i18nLocal.t('tip.soldout') }}</v-chip>
      </div>
    </template>
    <template #item.memory="{ item }">
      {{ getSkuInfo(item, 'memory').resourceQuantity || '-' }}
    </template>
    <template #item.gpuMemory="{ item }">
      {{ item.gpuMemory }}
    </template>
    <template #item.gpuMode="{ item }">
      <div v-if="getGpuInfo(item).icon" class="float-left">
        <BaseLogo class="mr-1" :icon-name="getGpuInfo(item).icon" :ml="0" :mt="2" :width="20" />
      </div>
      <div class="float-left table__gpu">
        {{ getGpuInfo(item).name }}
      </div>
      <div class="kubegems__clear-float" />
    </template>
    <template #item.cpuMode="{ item }">
      <div v-if="getCpuIcon(item.cpuMode)" class="float-left">
        <BaseLogo class="mr-1" :icon-name="getCpuIcon(item.cpuMode)" :ml="0" :mt="2" :width="20" />
      </div>
      <div class="float-left table__cpu">
        {{ item.cpuMode }}
      </div>
      <div class="kubegems__clear-float" />
    </template>
    <template #item.price="{ item }">
      <span class="orange--text"> ¥ {{ item.config.price }} </span>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { beautifyStorageUnit, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { ComputedRef, computed, onMounted, ref, watch } from 'vue';

  import { Instance, SkuResource } from '../../api/instance';
  import { Job } from '../../api/job';
  import { useI18n } from './i18n';

  const props = withDefaults(
    defineProps<{
      job: Job;
      value: string;
    }>(),
    {
      job: void 0,
      value: void 0,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const typed = ref('');
  const typedItems = [{ text: i18nLocal.t('tip.al'), value: '' }];
  const typedChanged = () => {
    filterType.value = 'cpu';
  };

  const named = ref('');
  const namedItems = [
    { text: i18nLocal.t('tip.al'), value: '', icon: '' },
    { text: `GTX ${i18nLocal.t('tip.serie')}`, value: 'G.', icon: 'nvidia_geforce' },
    { text: `Telsa P${i18nLocal.t('tip.serie')}`, value: 'T.P', icon: 'nvidia_tesla' },
    { text: `Telsa A${i18nLocal.t('tip.serie')}`, value: 'T.A', icon: 'nvidia_tesla' },
    { text: `Telsa T${i18nLocal.t('tip.serie')}`, value: 'T.T', icon: 'nvidia_tesla' },
  ];
  const namedChanged = () => {
    filterType.value = 'gpu';
  };

  const sgpud = ref('');
  const sgpudChanged = () => {
    filterType.value = 'sgpu';
  };

  const selected = ref([]);
  const instanceItems = ref([]);
  const headers = computed(() => {
    if (filterType.value === 'cpu') {
      return [
        { text: i18nLocal.t('table.cpu'), value: 'cpu', width: '150' },
        { text: i18nLocal.t('table.memory'), value: 'memory' },
        { text: i18nLocal.t('table.cpu_spec'), value: 'cpuMode' },
        { text: i18nLocal.t('table.price'), value: 'price' },
      ];
    }
    return [
      { text: i18nLocal.t('table.cpu'), value: 'cpu', width: '90' },
      { text: i18nLocal.t('table.memory'), value: 'memory' },
      { text: i18nLocal.t('table.gpu_memory'), value: 'gpuMemory' },
      { text: i18nLocal.t('table.gpu_spec'), value: 'gpuMode' },
      { text: i18nLocal.t('table.cpu_spec'), value: 'cpuMode' },
      { text: i18nLocal.t('table.price'), value: 'price' },
    ];
  });

  const filterType = ref('');
  const setFilterType = (_type: string) => {
    if (_type === filterType.value) filterType.value = '';
    else filterType.value = _type;
    named.value = '';
    typed.value = '';
    sgpud.value = '';
  };
  const filterInstanceItems: ComputedRef<Instance[]> = computed(() => {
    return instanceItems.value.filter((ins) => {
      let [typedResult, namedResult] = [true, true];

      if (filterType.value) {
        const hasGpu = Boolean(getSkuInfo(ins, 'gpu')?.resourceQuantity);
        typedResult = filterType.value === 'cpu' ? !hasGpu : hasGpu;
      }
      if (filterType.value === 'gpu') {
        namedResult = ins?.name?.indexOf(named.value) > -1 && ins?.name?.indexOf('-S') === -1;
      }
      if (filterType.value === 'sgpu') {
        namedResult = ins?.name?.indexOf(sgpud.value) > -1 && ins?.name?.indexOf('-S') > -1;
      }
      return typedResult && namedResult;
    });
  });
  const getInstanceList = async () => {
    const data = await new Instance({
      region: props.job.region || store.getters.Region().RegionName,
    }).getInstanceInfoListByTenant(store.getters.Tenant().TenantName);
    data.sort((a, b) => {
      return (a.name as any) - (b.name as any);
    });
    const _data = data.map((d) => {
      const cpu = getSkuInfo(d, 'cpu').resourceQuantity;
      const memory = sizeOfStorage(getSkuInfo(d, 'memory').resourceQuantity || '0');
      const gpuMode = `${getSkuInfo(d, 'gpu').name}${getSkuInfo(d, 'gpu').resourceQuantity}`;
      const gpuMemory = getSkuInfo(d, 'volcano.sh/vgpu-memory')?.resourceQuantity
        ? beautifyStorageUnit(
            parseInt(getSkuInfo(d, 'volcano.sh/vgpu-memory')?.resourceQuantity || '0') * 1024 * 1024,
            0,
          )
        : '-';
      const cpuMode = getSkuInfo(d, 'cpu')?.name?.replaceAll('-', ' ') || '-';
      const price = d.config.price;
      return {
        ...d,
        cpu,
        memory,
        gpuMode,
        gpuMemory,
        cpuMode,
        price,
      };
    });
    instanceItems.value = _data;

    const instance = instanceItems.value.find((item) => item.name === props.value);
    selected.value = [instance];
  };

  watch(
    () => props.value,
    (newValue) => {
      if (newValue) {
        const instance = instanceItems.value.find((item) => item.name === props.value);
        selected.value = [instance];
      } else {
        selected.value = [];
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const emit = defineEmits(['input', 'change']);
  const instanceSelected = (selected: { item: Instance; value: boolean }): void => {
    emit('input', selected.value ? selected.item.name : '');
    emit('change', selected.value ? selected.item.name : '');
  };

  const getSkuInfo = (item: Instance, type: string): SkuResource => {
    const resource = item?.resources?.find((r) => {
      return r.resourceName?.indexOf(type) > -1;
    });
    return new SkuResource(resource);
  };

  const getGpuInfo = (item: Instance): { name: string; icon: string } => {
    const _gpu = getSkuInfo(item, 'gpu');

    if (!_gpu.name) return { name: '-', icon: '' };
    const _gpuName = _gpu.name
      ?.replaceAll('-', ' ')
      ?.replaceAll('NVIDIA ', '')
      ?.replaceAll('Tesla ', '')
      ?.replaceAll('GeForce ', '');
    if (_gpu.resourceName.indexOf('volcano.sh') > -1)
      return {
        name: _gpuName,
        icon: 'nvidia',
      };
    return {
      name: `${_gpuName}  × ${_gpu.resourceQuantity}`,
      icon: 'nvidia',
    };
  };

  onMounted(() => {
    getInstanceList();
  });

  const refresh = () => {
    getInstanceList();
  };

  const getCpuIcon = (item: string): string => {
    if (item.toLocaleLowerCase().indexOf('intel') > -1) {
      return 'intel';
    } else if (item.toLocaleLowerCase().indexOf('amd') > -1) {
      return 'amd';
    }
    return '';
  };
</script>

<style lang="scss" scoped>
  .table {
    border: 2px solid var(--primary-color);

    &__gpu {
      line-height: 32px;
    }

    &__cpu {
      line-height: 32px;
    }
  }

  .table .v-data-table__wrapper {
    max-height: 240px;
  }

  .v-list--three-line .v-list-item,
  .v-list-item--three-line {
    min-height: 30px;
  }

  .filter {
    &__label {
      line-height: 70px;
    }
  }

  tbody tr {
    color: grey;
  }

  .refresh {
    position: absolute;
    right: 0;
    top: 10px;
    z-index: 99;
  }

  .select {
    float: left;
    width: 200px;
    height: 70px;
    border-radius: 10px;
    border: 2px solid var(--primary-color);
    cursor: pointer;
    margin-right: 12px;
    position: relative;

    &__title {
      text-align: center;
      height: 30px;
      line-height: 30px;
    }

    &__icon {
      position: absolute;
      top: 2px;
      right: 2px;
    }

    &__item {
      width: 120px;
      &__content {
        line-height: 29px;
      }
    }
  }
</style>
