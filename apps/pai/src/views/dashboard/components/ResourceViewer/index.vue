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
    <v-row>
      <v-col cols="3">
        <SetCard :capability-map="capabilityMap" :file-map="fileMap" :region="region" :total-map="totalMap" />
      </v-col>
      <v-col cols="3">
        <v-row>
          <v-col cols="12">
            <FileCard :data-map="fileMap" :title="i18nLocal.t('tip.files').toString()" type="file" />
          </v-col>
          <v-col class="pt-0" cols="12">
            <FileCard
              :data-map="capabilityMap"
              :title="i18nLocal.t('tip.capability').toString()"
              type="capability"
              unit-type="storage"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-row class="mt-0">
          <v-col class="pt-0" cols="6">
            <ResourceCard
              icon="mdi-cpu-64-bit"
              :region="region"
              title="CPU"
              :total="totalResource.cpu"
              type="cpu"
              :used="usedResource.cpu"
            />
          </v-col>
          <v-col class="pt-0" cols="6">
            <ResourceCard
              icon="mdi-nas"
              :region="region"
              :title="i18n.t('resource.memory').toString()"
              :total="totalResource.memory"
              type="memory"
              :used="usedResource.memory"
            />
          </v-col>
          <v-col class="pt-0" cols="6">
            <ResourceCard
              icon="mdi-expansion-card"
              :region="region"
              title="GPU"
              :total="totalResource.gpu"
              type="gpu"
              :used="usedResource.gpu"
            />
          </v-col>
          <v-col class="pt-0" cols="6">
            <ResourceCard
              icon="mdi-file-tree"
              :region="region"
              :summary="jobSummary"
              :title="i18n.t('resource.job').toString()"
              :total="totalResource.job"
              type="job"
              :used="usedResource.job"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import { Vector } from '@kubegems/api/typed/prometheus';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import {
    PAI_SET_CAPABILITY_PROMQL,
    PAI_SET_COUNT_PROMQL,
    PAI_SET_FILES_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { sizeOfCpu, sizeOfStorage } from '@kubegems/libs/utils/helpers';
  import { ref, watch } from 'vue';

  import { Region } from '../../../../api/region';
  import { Tenant } from '../../../../api/tenant';
  import { useI18n } from '../../i18n';
  import FileCard from './FileCard.vue';
  import ResourceCard from './ResourceCard.vue';
  import SetCard from './SetCard.vue';

  const props = withDefaults(
    defineProps<{
      region?: Region;
    }>(),
    {
      region: void 0,
    },
  );

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const usedResource = ref<{ cpu: string; memory: string; gpu: string; job: string }>({
    cpu: '0',
    memory: '0',
    gpu: '0',
    job: '0',
  });
  const totalResource = ref<{ cpu: number; memory: number; gpu: number; job: number }>({
    cpu: 0,
    memory: 0,
    gpu: 0,
    job: 0,
  });
  const jobSummary = ref<any>({});
  const getResource = async (): Promise<void> => {
    const resource = await new Tenant({
      region: props.region.name,
      tenant: store.getters.Tenant().TenantName,
    }).getResource();

    usedResource.value = {
      cpu: sizeOfCpu(resource?.cpu?.used).toString() || '0',
      memory: sizeOfStorage(resource?.memory?.used).toString() || '0',
      gpu: resource?.['nvidia.com/gpu']?.used || '0',
      job: resource?.job?.used || '0',
    };

    totalResource.value = {
      cpu: sizeOfCpu(resource?.cpu?.total || 0),
      memory: sizeOfStorage(resource?.memory?.total || 0),
      gpu: parseInt(resource?.['nvidia.com/gpu']?.total) || 0,
      job: parseInt(resource?.job?.total) || 0,
    };
    jobSummary.value = {
      training: resource['job.training'] || { total: '0', used: '0' },
      modeling: resource['job.modeling'] || { total: '0', used: '0' },
      inference: resource['job.inference'] || { total: '0', used: '0' },
    };
  };

  const totalMap = ref<any>({
    workspace: 0,
    dataset: 0,
    modelset: 0,
  });
  const getSetCount = async (): Promise<void> => {
    let query = PAI_SET_COUNT_PROMQL.replaceAll('$1', store.getters.Tenant().TenantName);
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, { query: query, noprocessing: true });
    data.forEach((d) => {
      if (d.metric?.storageset_kind) totalMap.value[d.metric?.storageset_kind] = d.value[1];
    });
  };

  const fileMap = ref<any>({
    workspace: 0,
    dataset: 0,
    modelset: 0,
  });
  const getFile = async (): Promise<void> => {
    let query = PAI_SET_FILES_PROMQL.replaceAll('$1', store.getters.Tenant().TenantName);
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, { query: query, noprocessing: true });
    data.forEach((d) => {
      if (d.metric?.storageset_kind) fileMap.value[d.metric?.storageset_kind] = d.value[1];
    });
  };

  const capabilityMap = ref<any>({
    workspace: 0,
    dataset: 0,
    modelset: 0,
  });
  const getCapability = async (): Promise<void> => {
    let query = PAI_SET_CAPABILITY_PROMQL.replaceAll('$1', store.getters.Tenant().TenantName);
    query = query.replaceAll('%', '');
    const data = await new Vector().getVector(props.region.clusterName, { query: query, noprocessing: true });
    data.forEach((d) => {
      if (d.metric?.storageset_kind) capabilityMap.value[d.metric?.storageset_kind] = d.value[1];
    });
  };

  watch(
    () => props.region,
    (newValue) => {
      if (newValue) {
        getResource();
        getSetCount();
        getFile();
        getCapability();
      }
    },
    { immediate: true, deep: true },
  );
</script>
