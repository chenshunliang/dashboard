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
  <v-card class="mt-3">
    <BaseSubTitle class="pt-2" :divider="false" :title="i18nLocal.t('tip.my_task')" />
    <v-flex class="px-2">
      <v-expansion-panels accordion focusable>
        <v-expansion-panel>
          <v-expansion-panel-header />
          <v-expansion-panel-content />
        </v-expansion-panel>
      </v-expansion-panels>
    </v-flex>
  </v-card>
</template>

<script lang="ts" setup>
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
</script>
