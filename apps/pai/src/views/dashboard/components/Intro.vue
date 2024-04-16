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
  <v-row class="mt-0">
    <v-col cols="4">
      <v-card class="pa-2" flat height="100%">
        <BaseSubTitle class="pt-2" :divider="false" :title="i18nLocal.t('tip.pai')" />
        <v-stepper class="pb-0" vertical>
          <template v-for="(item, index) in steps">
            <v-stepper-step
              :key="item.id"
              complete
              :complete-icon="`mdi-numeric-${index + 1}`"
              :edit-icon="`mdi-numeric-${index + 1}`"
              editable
              :step="index + 1"
            >
              <span class="kubegems__text">{{ item.name }}</span>
              <small class="mt-2 text-body-2">
                {{ item.desc }}
              </small>
            </v-stepper-step>
            <v-stepper-content :key="`${item.id}Content`" :step="index + 1" />
          </template>
        </v-stepper>
      </v-card>
    </v-col>
    <v-col cols="8">
      <v-card class="pa-4" flat height="100%">
        <div class="kubegems__text">
          <img src="/img/pai/welcome.svg" width="90%" />
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();

  const steps = [
    {
      id: 'data',
      name: i18nLocal.t('tip.prepare_data'),
      desc: i18nLocal.t('tip.prepare_data_desc'),
    },
    {
      id: 'dev',
      name: i18nLocal.t('tip.model_dev'),
      desc: i18nLocal.t('tip.model_dev_desc'),
    },
    {
      id: 'train',
      name: i18nLocal.t('tip.model_train'),
      desc: i18nLocal.t('tip.model_train_desc'),
    },
    {
      id: 'deploy',
      name: i18nLocal.t('tip.model_deploy'),
      desc: i18nLocal.t('tip.model_deploy_desc'),
    },
  ];
</script>

<style scoped>
  .v-stepper--vertical .v-stepper__step {
    padding: 10px 24px;
  }

  .kubegems__text img {
    margin-left: 5%;
  }
</style>
