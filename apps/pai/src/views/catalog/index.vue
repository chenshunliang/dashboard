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
          <div class="float-right">
            <RegionSelect v-model="region" />
          </div>
          <div class="kubegems__clear-float" />
        </v-flex>
      </template>
    </BaseBreadcrumb>

    <template v-if="useQueueCheck()">
      <Catalog v-model="catalog" />
      <RecommendList :region="region" :source="catalog" />
    </template>

    <BaseQueuePremission v-else />
  </v-container>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  import { Region } from '../../api/region';
  import { useQueueCheck } from '../../hooks/precheck';
  import RegionSelect from '../components/RegionSelect.vue';
  import Catalog from './components/Catalog.vue';
  import RecommendList from './components/RecommendList.vue';

  const catalog = ref('');

  const region = ref<Region>(void 0);
</script>
