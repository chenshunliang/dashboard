<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-menu
    :close-delay="200"
    :close-on-content-click="false"
    left
    max-width="200px"
    nudge-bottom="5px"
    offset-y
    open-on-hover
    :origin="`${top ? 'bottom center' : 'top center'}`"
    :top="top"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <span class="kubegems__pointer kubegems__attach-position" v-on="on">
        <slot name="trigger" />
      </span>
    </template>
    <v-card flat width="100%">
      <v-flex class="text-body-2 text-center primary white--text py-2">
        <v-icon color="white" left small>{{ type === 'file' ? 'mdi-file' : 'mdi-database' }} </v-icon>
        <span>{{ type === 'file' ? i18nLocal.t('tip.file') : i18nLocal.t('tip.capability') }}</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense>
        <v-list-item>
          <v-list-item-content>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title>
                  {{ type === 'file' ? i18nLocal.t('tip.file') : i18nLocal.t('tip.capability') }}
                </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  <div v-for="(key, index) in Object.keys(dataMap || {})" :key="index" class="text-caption">
                    <div class="float-left">
                      <v-avatar class="mr-1" size="10" :style="{ backgroundColor: LINE_THEME_COLORS[index % 10] }">
                        <span class="white--text text-h5" />
                      </v-avatar>
                    </div>
                    <div class="float-left">{{ key }}</div>
                    <div class="float-right">
                      {{ type === 'file' ? beautifyFloatNum(dataMap[key]) : beautifyStorageUnit(dataMap[key]) }}
                    </div>
                    <div class="kubegems__clear-float" />
                  </div>
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
  import { LINE_THEME_COLORS } from '@kubegems/libs/constants/chart';
  import { beautifyFloatNum, beautifyStorageUnit } from '@kubegems/libs/utils/helpers';

  import { useI18n } from '../../i18n';

  const i18nLocal = useI18n();

  withDefaults(
    defineProps<{
      dataMap?: { [key: string]: number };
      top?: boolean;
      type?: string;
    }>(),
    {
      dataMap: () => {
        return {};
      },
      top: false,
      type: 'file',
    },
  );
</script>
