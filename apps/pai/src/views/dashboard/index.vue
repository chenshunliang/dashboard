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
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <div class="float-left tenant__tip mr-4">
            {{ i18n.t('resource.tenant') }} : {{ store.getters.Tenant().TenantName }}
          </div>
          <div class="float-right">
            <RegionSelect v-model="region" />
          </div>
          <div class="kubegems__clear-float" />
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <template v-if="useQueueCheck()">
      <ResourceViewer :region="region" />

      <Intro />
    </template>

    <BaseQueuePremission v-else />
  </v-container>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { ref } from 'vue';

  import { Region } from '../../api/region';
  import { useQueueCheck } from '../../hooks/precheck';
  import RegionSelect from '../components/RegionSelect.vue';
  import Intro from './components/Intro.vue';
  import ResourceViewer from './components/ResourceViewer/index.vue';

  const store = useStore();
  const i18n = useGlobalI18n();

  const region = ref<Region>(void 0);
</script>

<style lang="scss" scoped>
  .tenant__tip {
    line-height: 36px;
  }
</style>
