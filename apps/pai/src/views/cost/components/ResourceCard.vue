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
  <v-row>
    <v-col class="mb-2" cols="2">
      <BaseInfoCard
        icon="mdi-server"
        :num="statistics ? statistics['count.clusters'] : 0"
        :title="i18nLocal.t('tip.my_job')"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-cube-outline"
        :num="statistics ? statistics['count.projects'] : 0"
        :title="i18nLocal.t('tip.my_instance')"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-cloud"
        :num="statistics ? statistics['count.environments'] : 0"
        :title="i18nLocal.t('tip.allocate_gpu')"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-vector-arrange-above"
        :num="statistics ? statistics['count.workloads'] : 0"
        :title="i18nLocal.t('tip.allocate_gpu_memory')"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-cube"
        :num="statistics ? statistics['count.pods'] : 0"
        :title="i18nLocal.t('tip.allocate_cpu')"
      />
    </v-col>
    <v-col class="pb-0" cols="2">
      <BaseInfoCard
        icon="mdi-account"
        :num="statistics ? statistics['count.users'] : 0"
        :title="i18nLocal.t('tip.allocate_memory')"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();

  withDefaults(
    defineProps<{
      statistics?: any;
    }>(),
    {
      statistics: void 0,
    },
  );
</script>
