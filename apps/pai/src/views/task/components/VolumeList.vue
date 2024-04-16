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
  <div :style="{ overflowY: 'auto', maxHeight: `calc((100vh - 264px) / ${store.state.Scale})` }">
    <v-card v-for="(item, index) in job.config.roles || []" :key="index" class="mb-3">
      <div class="pt-3 px-4 text-subtitle-2 primary--text">{{ item.name }}</div>
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">{{ i18nLocal.t('table.volume_name') }}</th>
              <th class="text-left">{{ i18nLocal.t('table.volume_kind') }}</th>
              <th class="text-left"> {{ i18nLocal.t('table.target_path') }} </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, idx) in item.volumeMountSets || []" :key="idx">
              <td>
                <span>{{ it.name }} </span>
              </td>
              <td>{{ i18nLocal.t(`tip.${it.kind}`) }} ({{ it.kind }})</td>
              <td>{{ it.targetPath }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';

  import { Job } from '../../../api/job';
  import { useI18n } from '../i18n';

  withDefaults(
    defineProps<{
      job?: Job;
    }>(),
    {
      job: void 0,
    },
  );

  const i18nLocal = useI18n();
  const store = useStore();
</script>
