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
        <v-icon color="white" left small> mdi-adjust </v-icon>
        <span>{{ i18nLocal.t('table.status') }}</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense>
        <v-list-item>
          <v-list-item-content>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title> {{ i18nLocal.t('tip.startup_time') }} </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  {{ downloader ? moment(downloader.startTimestamp || '-').format('YYYY-MM-DD HH:mm:ss') : '-' }}
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title>
                  {{ i18nLocal.t('table.status') }}
                  <v-btn color="primary" icon small>
                    <v-icon small @click="toAsyncTask">mdi-open-in-new</v-icon>
                  </v-btn>
                </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  {{ downloader ? downloader.message || '-' : '-' }}
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
  import { useMeta, useParams, useRouter } from '@kubegems/extension/router';
  import moment from 'moment';
  import { computed } from 'vue';

  import { Downloader } from '../../api/base';
  import { useI18n } from './i18n';

  const props = withDefaults(
    defineProps<{
      top?: boolean;
      downloader?: Downloader;
      name?: string;
      tenant?: string;
    }>(),
    {
      top: false,
      downloader: void 0,
      name: '',
      tenant: '',
    },
  );

  const i18nLocal = useI18n();

  const router = useRouter();
  const routerParams = useParams();

  const isAdmin = computed(() => {
    return (useMeta() as any)?.admin;
  });

  const toAsyncTask = () => {
    const href = router.resolve({
      name: isAdmin ? 'admin-pai-async-task' : 'pai-async-task',
      params: {
        region: routerParams.value.region,
        tenant: props.tenant,
      },
      query: {
        search: props.name,
      },
    }).href;
    window.open(href);
  };
</script>
