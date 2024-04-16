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
  <v-card>
    <BaseSubTitle :divider="false" :title="i18nLocal.t('tip.cost_trand')">
      <template #selector>
        <v-sheet class="text-body-2 text--darken-1">
          <BaseDatetimePicker v-model="date" :default-value="30" unit="" />
        </v-sheet>
      </template>
    </BaseSubTitle>
    <BaseAreaChart
      :class="`clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')} px-3`"
      :global-plugins-check="false"
    />
  </v-card>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import { ref } from 'vue';

  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const store = useStore();

  const date = ref([]);
</script>
