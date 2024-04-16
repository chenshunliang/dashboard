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
  <v-card class="overflow-hidden" elevation="0" height="412px">
    <v-card-text class="pb-1">
      <div class="d-flex align-center">
        <h2 class="text-h6 text-h6 mb-1 primary--text">{{ i18nLocal.t('tip.data') }}</h2>
      </div>
      <!-- lists -->
      <div v-for="(item, key) in iconMap || {}" :key="key" class="px-2">
        <div class="d-flex align-center py-2">
          <div class>
            <v-btn class="elevation-0" color="primary" dark fab small>
              <v-icon>{{ iconMap[key] }}</v-icon>
            </v-btn>
          </div>
          <div class="ml-2">
            <h4 class="text-subtitle-1 mb-1 mt-n1">
              {{ i18nLocal.t(`tip.${key}`) }}
            </h4>
            <span class="text-grey-darken-1 text-subtitle-2 d-block text-truncate">{{ key }}</span>
          </div>
          <div class="ml-auto">
            <div class="text-h5">
              <v-btn class="elevation-0" color="primary" dark fab small @click="openPanel(key, totalMap[key])">
                {{ totalMap[key] || 0 }}
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>

    <FilePanel ref="panel" :capability-map="capabilityMap" :file-map="fileMap" :region="region" />
  </v-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  import { Region } from '../../../../api/region';
  import { useI18n } from '../../i18n';
  import FilePanel from './FilePanel.vue';

  withDefaults(
    defineProps<{
      totalMap: { workspace: number; dataset: number; modelset: number };
      fileMap: { workspace: number; dataset: number; modelset: number };
      capabilityMap: { workspace: number; dataset: number; modelset: number };
      region?: Region;
    }>(),
    {
      totalMap: void 0,
      fileMap: void 0,
      capabilityMap: void 0,
      region: void 0,
    },
  );

  const i18nLocal = useI18n();

  const panel = ref(null);
  const openPanel = (type: string, files: number) => {
    panel.value.init(type, files);
    panel.value.open();
  };

  const iconMap = {
    workspace: 'mdi-home',
    dataset: 'mdi-database',
    modelset: 'mdi-microsoft',
    codeset: 'mdi-code-json',
    output: 'mdi-logout',
  };
</script>
