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
  <v-menu
    :close-delay="200"
    :close-on-content-click="false"
    max-width="200px"
    min-width="150px"
    nudge-bottom="5px"
    offset-y
    open-on-hover
    origin="bottom center"
    right
    top
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <span class="kubegems__pointer kubegems__attach-position" v-on="on">
        <slot name="trigger" />
      </span>
    </template>
    <v-card flat width="100%">
      <v-flex class="text-body-2 text-center primary white--text py-2">
        <v-icon color="white" left small> mdi-cog </v-icon>
        <span>{{ instance ? instance.name : '' }}</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense>
        <v-list-item>
          <v-list-item-content>
            <v-list-item
              v-for="(item, index) in instance ? instance.resources : []"
              :key="index"
              class="float-left pa-0"
              two-line
            >
              <v-list-item-content class="py-0">
                <v-list-item-title>
                  {{ i18nLocal.t(`tip.${item.resourceName.replaceAll('/', '_').replaceAll('.', '_')}`) }}
                </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  {{ item.name }} × {{ item.resourceQuantity }}
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { Instance } from '../../../api/instance';
  import { useI18n } from '../i18n';

  withDefaults(
    defineProps<{
      instance?: Instance;
    }>(),
    {
      instance: void 0,
    },
  );

  const i18nLocal = useI18n();
</script>
