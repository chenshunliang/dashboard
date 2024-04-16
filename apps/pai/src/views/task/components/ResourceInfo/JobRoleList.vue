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
  <v-simple-table class="mx-2 pa-2 pb-3">
    <template #default>
      <thead>
        <tr>
          <th class="text-left">{{ i18nLocal.t('table.role_name') }}</th>
          <th class="text-left" width="400px">{{ i18nLocal.t('table.image') }}</th>
          <th class="text-left"> {{ i18nLocal.t('table.replicas') }} </th>
          <th class="text-left"> {{ i18nLocal.t('table.cpu') }} </th>
          <th class="text-left"> {{ i18nLocal.t('table.memory') }} </th>
          <th class="text-left">{{ i18nLocal.t('table.gpu') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in job ? job.config.roles : []" :key="index">
          <td>{{ item.name }}</td>
          <td>{{ item.image }}</td>
          <td>{{ item.replicas }}</td>
          <td>
            <BaseCollapseChips
              :chips="roleSkuMap[item.name] ? roleSkuMap[item.name].cpu || {} : {}"
              icon="mdi-memory"
              single-line
            />
          </td>
          <td>
            {{
              roleSkuMap[item.name] && roleSkuMap[item.name].memory ? roleSkuMap[item.name].memory.memory || '-' : '-'
            }}
          </td>
          <td>
            <BaseCollapseChips
              :chips="roleSkuMap[item.name] ? roleSkuMap[item.name].gpu || {} : {}"
              icon="mdi-expansion-card"
              single-line
            />
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  import { Job, Role } from '../../../../api/job';
  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      job?: Job;
    }>(),
    {
      job: void 0,
    },
  );

  const i18nLocal = useI18n();

  const getResources = (role: Role, type: string): { [key: string]: string } => {
    const sku = role.skuDetails?.resources?.find((res) => {
      return res.resourceName.indexOf(type) > -1;
    });
    return sku ? { [sku.name]: sku.resourceQuantity } : undefined;
  };

  const roleSkuMap = computed(() => {
    const map = {};
    props.job?.config.roles.forEach((role) => {
      map[role.name] = {
        cpu: getResources(role, 'cpu'),
        memory: getResources(role, 'memory'),
        gpu: getResources(role, 'gpu'),
      };
    });
    return map;
  });
</script>
