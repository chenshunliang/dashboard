<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-autocomplete
    v-model="project"
    dense
    flat
    hide-details
    hide-selected
    :items="projectItems"
    :label="i18nLocal.t('tip.filter_project')"
    :no-data-text="i18n.t('data.no_data')"
    prepend-inner-icon="mdi-magnify"
    solo
    :style="{ maxWidth: `500px` }"
    @change="projectChanged"
  >
    <template #selection="{ item }">
      <v-chip color="primary" label small> {{ i18n.t('resource.project') }} : {{ item.text }} </v-chip>
    </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import { useProjectListInTenant } from '@/composition/tenant';
  import { useGlobalI18n } from '@/i18n';
  import { Tenant } from '@/types/tenant';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const props = withDefaults(
    defineProps<{
      tenant?: { ID: number; TenantName: string };
    }>(),
    {
      tenant: undefined,
    },
  );

  const project = ref<number>(undefined);
  const projectItems = ref<{ text: string; value: number }[]>([]);
  const emit = defineEmits(['input', 'change']);
  const getProjectList = async () => {
    const data = await useProjectListInTenant(new Tenant({ ID: props.tenant.ID }));
    projectItems.value = data.map((p) => {
      return { text: p.ProjectName, value: p.ID };
    });
    if (projectItems.value.length > 0) {
      project.value = projectItems.value[0].value;
      emit('input', project.value);
      emit('change', project.value);
    }
  };

  const projectChanged = () => {
    emit('input', project.value);
    emit('change', project.value);
  };

  watch(
    () => props.tenant,
    async (newValue) => {
      if (!newValue) return;
      getProjectList();
    },
    { deep: true },
  );
</script>
