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
    <v-card>
      <BaseSubTitle class="pt-2" :divider="false" :title="i18nLocal.t('tip.job_role')" />
      <JobRoleList :job="job" />
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="i18nLocal.t('resource.instance')" />
      <InstanceList :job="job" />
    </v-card>
  </div>
</template>

<script lang="ts" setup>
  import { Job } from '../../../../api/job';
  import { useI18n } from '../../i18n';
  import InstanceList from './InstanceList/index.vue';
  import JobRoleList from './JobRoleList.vue';

  withDefaults(
    defineProps<{
      job?: Job;
    }>(),
    {
      job: void 0,
    },
  );

  const i18nLocal = useI18n();
</script>
