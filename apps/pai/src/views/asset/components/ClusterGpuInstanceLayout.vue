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
  <v-container fluid>
    <BaseSplitContainer side-width="250px" :title="i18nLocal.t('resource.instance')" :tooltip="!!instance">
      <ClusterGpuInstanceTree slot="side" v-model="instance" @change="instanceChanged" />

      <div v-if="!!instance" slot="tooltip" class="text-caption" :style="{ maxWidth: '200px' }">
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-map </v-icon>
          <span>{{ i18nLocal.t('resource.instance') }}</span>
        </v-flex>
        <v-list class="pa-0 kubegems__tip" dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ i18nLocal.t('tip.region') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ instance.region }}
              </v-list-item-content>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ i18nLocal.t('tip.spec_type') }}</v-list-item-title>
              <v-list-item-content class="text-caption kubegems__text">
                {{ instance.name }}
              </v-list-item-content>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
      <EmptyOverlay :text="i18nLocal.t('tip.select_instance').toString()" :visible="!instance" />

      <slot />
    </BaseSplitContainer>
  </v-container>
</template>

<script lang="ts" setup>
  import { useQuery, useRouter } from '@kubegems/extension/router';
  import { ref } from 'vue';

  import { useI18n } from '../i18n';
  import ClusterGpuInstanceTree from './ClusterGpuInstanceTree.vue';
  import EmptyOverlay from './EmptyOverlay.vue';

  const i18nLocal = useI18n();
  const router = useRouter();
  const query = useQuery();

  const instance = ref(void 0);

  const instanceChanged = (leaf: any): void => {
    router.replace({
      query: {
        ...query.value,
        region: leaf?.region || '',
        catalog: leaf?.name || '',
      },
    });
  };
</script>
