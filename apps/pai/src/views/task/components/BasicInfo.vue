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
  <v-card flat>
    <v-card-title class="text-h6 primary--text">
      <div>
        <div class="float-left">
          {{ routeParams.name }}
        </div>
        <div class="text-body-2 ml-2 grey--text float-left status">
          <BaseStatus :bg-color="POD_STATUS_COLOR[getStatus(job)]" :status="getStatus(job) || 'Unknown'" />
        </div>
        <div class="text-body-2 grey--text message kubegems__clear-float">
          {{ job.status ? job.status.message || '' : '' }}
        </div>
      </div>
    </v-card-title>

    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.region') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">{{ store.getters.Region().RegionName }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.task_type') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ taskType }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.task_queue') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ job.config.queue }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.queue_priority') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ job.config.priority }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.spec') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          <SkuInfo :instance="job.config.roles[0].skuDetails">
            <template #trigger>
              <BaseCollapseChips :chips="getShowSpec(job)" force-show icon="mdi-expansion-card" single-line />
            </template>
          </SkuInfo>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.creator') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ job.creator }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.create_at') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2">
          {{ moment(job.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.desc') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2" :style="{ whiteSpace: 'normal' }">
          {{ job.description }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item two-line>
      <v-list-item-content class="kubegems__text">
        <v-list-item-title class="text-subtitle-2"> {{ i18nLocal.t('tip.expired') }} </v-list-item-title>
        <v-list-item-subtitle class="text-body-2"> {{ expired }} </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import moment from 'moment';
  import { ComputedRef, computed } from 'vue';

  import { Job } from '../../../api/job';
  import SkuInfo from '../../develop/components/SkuInfo.vue';
  import { useI18n } from '../i18n';

  const props = withDefaults(
    defineProps<{
      job?: Job;
    }>(),
    {
      job: void 0,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const routeParams = useParams();
  const store = useStore();

  const taskType = computed(() => {
    if (props.job.config.roles.length > 1) {
      return i18nLocal.t('tip.multi_n_multi_g').toString();
    }
    const single = props.job.config.roles.some((role) => {
      const instance = role.skuDetails;
      return instance?.resources?.some((r) => {
        return r.resourceName.indexOf('gpu') > -1 && r.resourceQuantity === '1';
      });
    });
    if (single) return i18nLocal.t('tip.single_n_single_g').toString();
    return i18nLocal.t('tip.single_n_multi_g').toString();
  });

  const expired: ComputedRef<string> = computed(() => {
    const ttl = props.job?.config?.ttl;
    if (ttl && ttl !== '0' && ttl !== '0s') {
      const [hour, minute] = ttl.split(new RegExp('[hms]'));
      const minutes = parseInt(hour || '0') * 60 + parseInt(minute || '0');
      return moment(props.job.updatedAt || props.job.createdAt || new Date())
        .add(minutes, 'minutes')
        .format('YYYY-MM-DD HH:mm:ss');
    }
    return i18nLocal.t('tip.no_expired').toString();
  });

  const getShowSpec = (item: Job): { [key: string]: string } => {
    const sku = item.config.roles[0].skuDetails;
    if (sku) {
      const gpu = sku.resources?.find((r) => r.resourceName.indexOf('gpu') > -1);
      const cpu = sku.resources?.find((r) => r.resourceName.indexOf('cpu') > -1);
      const memory = sku.resources?.find((r) => r.resourceName.indexOf('memory') > -1);
      return gpu
        ? {
            '': `GPU: ${gpu?.resourceQuantity || '-'}, CPU: ${cpu?.resourceQuantity || '-'}, ${i18n.t(
              'resource.memory',
            )}: ${memory?.resourceQuantity || '-'}`,
          }
        : {
            '': `CPU: ${cpu?.resourceQuantity || '-'}, ${i18n.t('resource.memory')}: ${
              memory?.resourceQuantity || '-'
            }`,
          };
    }
    return {};
  };

  const getStatus = (item: Job): string => {
    if (item.deletedAt) {
      return 'InDelete';
    }
    return item.status?.state?.phase || '';
  };
</script>

<style lang="scss" scoped>
  .message {
    white-space: normal !important;
  }

  .status {
    line-height: 32px;
  }
</style>
