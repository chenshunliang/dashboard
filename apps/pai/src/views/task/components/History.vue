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
    max-height="250px"
    max-width="230px"
    min-width="150px"
    nudge-bottom="5px"
    offset-y
    open-on-hover
    :origin="`${top ? 'bottom center' : 'top center'}`"
    right
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
        <v-icon color="white" left small> mdi-history </v-icon>
        <span>{{ i18nLocal.t('tip.history') }}</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense max-height="210">
        <v-list-item>
          <v-list-item-content>
            <v-list-item
              v-for="(item, index) in job && job.status && job.status.history ? job.status.history : []"
              :key="index"
              class="float-left pa-0"
              two-line
            >
              <v-list-item-content class="py-0">
                <v-list-item-title>
                  {{ i18nLocal.t('tip.task') }} {{ index + 1 }}
                  <v-chip class="float-right white--text" :color="POD_STATUS_COLOR[item.phase] || 'grey'" label x-small>
                    {{ item.phase || '-' }}
                  </v-chip>
                </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  <div>
                    {{ i18nLocal.t('tip.start_time') }}:{{
                      item.startTimestamp ? moment(item.startTimestamp).format('YYYY-MM-DD HH:mm:ss') : '-'
                    }}
                  </div>
                  <div>
                    {{ i18nLocal.t('tip.end_time') }}:{{
                      item.finishTimestamp ? moment(item.finishTimestamp).format('YYYY-MM-DD HH:mm:ss') : '-'
                    }}
                  </div>
                </v-list-item-content>
                <v-divider class="mb-2" />
              </v-list-item-content>
            </v-list-item>
            <div
              v-if="!job || !job.status || !job.status.history || job.status.history.length === 0"
              class="text-center"
            >
              -
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import moment from 'moment';

  import { Job } from '../../../api/job';
  import { useI18n } from '../i18n';

  withDefaults(
    defineProps<{
      job?: Job;
      top?: boolean;
    }>(),
    {
      job: void 0,
      top: false,
    },
  );

  const i18nLocal = useI18n();
</script>
