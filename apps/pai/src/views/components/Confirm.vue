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
  <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
    <BaseSubTitle :title="i18nLocal.t('tip.conf_list')" />
    <v-card-text class="pa-2">
      <v-flex v-for="(item, index) in job.config.roles" :key="index" class="grey lighten-4 rounded mb-3">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-1 py-0 text-start">
              <v-row class="py-2">
                <v-col v-if="job.config.kind === 'training'" cols="6">
                  <div class="text-body-2">
                    {{ i18nLocal.t('tip.role_name') }}:
                    {{ item.name }}
                  </div>
                </v-col>
                <v-col v-if="job.config.kind === 'training' || job.config.kind === 'inference'" cols="6">
                  <div class="text-body-2">
                    {{ i18nLocal.t('tip.replicas') }}:
                    {{ item.replicas }}
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="text-body-2">
                    {{ i18nLocal.t('tip.typed') }}:
                    {{ item.sku }}
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-body-2">
                    CPU:
                    {{ getSkuInfo(instanceMap[item.name], 'cpu').name }}
                    {{ getSkuInfo(instanceMap[item.name], 'cpu').resourceQuantity }} vCPU
                  </div>
                </v-col>
                <v-col cols="6">
                  <div v-if="getSkuInfo(instanceMap[item.name], 'gpu').name" class="text-body-2">
                    GPU:
                    {{ getSkuInfo(instanceMap[item.name], 'gpu').name }}
                    {{ getSkuInfo(instanceMap[item.name], 'gpu').resourceQuantity }} {{ i18nLocal.t('tip.core') }}
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="text-body-2">
                    {{ i18nLocal.t('tip.image') }}:
                    {{ item.image }}
                  </div>
                </v-col>
                <v-col v-if="job.config.kind === 'training' || job.config.kind === 'inference'" cols="12">
                  <div class="text-body-2">
                    {{ i18nLocal.t('tip.command') }}:
                    {{ item.command.join(' ') }}
                  </div>
                </v-col>
              </v-row>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </v-card-text>
    <BaseSubTitle :title="i18nLocal.t('tip.period')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="4">
          <v-switch v-model="customTime" hide-details :label="i18nLocal.t('tip.custom_time')" />
        </v-col>
        <v-col v-if="!customTime" cols="9">
          <div class="text-body-1 mb-2">{{ i18nLocal.t('tip.run_time') }}</div>
          <v-btn-toggle v-model="tick" color="primary" dense @change="tickChanged">
            <v-btn v-for="(item, index) in tickLabels" :key="index" class="px-6" depressed>
              {{ item.text }}
            </v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col v-else cols="9">
          <div class="text-body-1 mb-2">{{ i18nLocal.t('tip.expired_time') }}</div>
          <BaseDatePicker v-model="datePicker" :pl="2" revert timer @change="datePickerChange" />
        </v-col>
      </v-row>
    </v-card-text>
    <BaseSubTitle :title="i18nLocal.t('tip.cost_optz')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col>
          <v-switch :label="i18nLocal.t('tip.monitor_report')" readonly />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { ComputedRef, computed, onMounted, reactive, ref, watch } from 'vue';

  import { Instance, SkuResource } from '../../api/instance';
  import { Job } from '../../api/job';
  import { useI18n } from './i18n';

  const i18nLocal = useI18n();

  const props = withDefaults(
    defineProps<{
      job?: Job;
      edit?: boolean;
    }>(),
    {
      job: void 0,
      edit: false,
    },
  );

  const state = reactive({
    valid: false,
  });
  const instanceItems = ref([]);
  const getInstanceList = async () => {
    const data = await new Instance({ region: props.job.region }).getInstanceInfoList();
    instanceItems.value = data;
  };

  const instanceMap: ComputedRef<{ [key: string]: Instance }> = computed(() => {
    const insMap = {};
    props.job.config.roles.forEach((r) => {
      const ins = instanceItems.value.find((item) => {
        return item.name === r.sku;
      });
      if (ins) {
        insMap[r.name] = ins;
      }
    });
    return insMap;
  });

  const getSkuInfo = (item: Instance, type: string): SkuResource => {
    const resource = item?.resources?.find((r) => {
      return r.resourceName.indexOf(type) > -1;
    });
    return new SkuResource(resource);
  };

  onMounted(() => {
    getInstanceList();
  });

  const obj = ref(props.job);

  const tick = ref(0);
  const tickLabels = [
    { text: i18nLocal.t('tip.no_limit'), value: '0' },
    { text: i18nLocal.t('tip.six_hours'), value: '6h0m0s' },
    { text: i18nLocal.t('tip.half_day'), value: '12h0m0s' },
    { text: i18nLocal.t('tip.one_day'), value: '24h0m0s' },
    { text: i18nLocal.t('tip.two_days'), value: '48h0m0s' },
    { text: i18nLocal.t('tip.one_week'), value: '168h0m0s' },
  ];
  const tickChanged = (): void => {
    if (tick.value) {
      obj.value.config.ttl = tickLabels[tick.value].value;
    } else {
      obj.value.config.ttl = null;
    }
  };
  const customTime = ref(false);
  const datePicker = ref('');
  const datePickerChange = () => {
    if (datePicker.value) {
      const interMillSeconds = moment(datePicker.value).valueOf() - moment().valueOf();
      let ttl = '';
      const hours = interMillSeconds / 1000 / 60 / 60;
      if (hours >= 1) {
        ttl += `${parseInt(hours.toString())}h`;
      }
      const minutes = (interMillSeconds - parseInt(hours.toString()) * 60 * 60 * 1000) / 1000 / 60;
      if (minutes >= 1) {
        ttl += `${parseInt(minutes.toString())}m`;
      }
      obj.value.config.ttl = ttl;
    } else {
      obj.value.config.ttl = null;
    }
  };

  watch(
    () => props.job,
    (newValue) => {
      if (props.edit && newValue.name) {
        obj.value = newValue;
      }
      const index = tickLabels.findIndex((item) => item.value === newValue.config.ttl);
      if (index === -1 && newValue.config.ttl !== '0') {
        if (newValue.config.ttl === null || newValue.config.ttl === '0s') {
          tick.value = 0;
          return;
        }
        customTime.value = true;
        const [hour, minute] = newValue.config?.ttl?.split(new RegExp('[hms]'));
        const minutes = parseInt(hour || '0') * 60 + parseInt(minute || '0');
        datePicker.value = moment(props.job.updatedAt || props.job.createdAt || new Date())
          .add(minutes, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss');
      } else {
        tick.value = index;
      }
    },
    { deep: true, immediate: true },
  );

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate();
  };

  const reset = (): void => {
    form.value.resetValidation();
    customTime.value = false;
  };

  defineExpose({
    validate,
    reset,
  });
</script>
