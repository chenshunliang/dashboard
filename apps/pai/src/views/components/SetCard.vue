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
  <v-hover #default="{ hover }">
    <v-card class="mx-auto pa-3" :elevation="hover ? 5 : 0" flat height="100%">
      <template v-if="item.public && applyFor === 'self'">
        <v-flex
          v-for="(item, key) in [
            { t: 100, r: 20 },
            { t: 160, r: 50 },
            { t: 100, r: 80 },
            { t: 160, r: 110 },
            { t: 100, r: 140 },
            { t: 160, r: 170 },
            { t: 100, r: 200 },
            { t: 160, r: 230 },
            { t: 100, r: 260 },
          ]"
          :key="key"
          class="watermark"
          :style="{ top: `${item.t}px`, right: `${item.r}px` }"
        >
          {{ i18nLocal.t('tip.public_modelset') }}
        </v-flex>
      </template>
      <v-menu v-if="applyFor === 'management' || applyFor === 'self'" left>
        <template #activator="{ on }">
          <v-btn class="float-right" icon>
            <v-icon color="primary" small v-on="on"> mdi-cog </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-text class="pa-2">
            <template v-if="applyFor === 'self'">
              <v-flex v-if="item.public">
                <v-btn color="error" small text @click="privateSet(item)">
                  {{ i18nLocal.t('operate.private') }}
                </v-btn>
              </v-flex>
              <v-flex v-else>
                <v-btn color="primary" small text @click="publicSet(item)">
                  {{ i18nLocal.t('operate.open') }}
                </v-btn>
              </v-flex>
              <v-flex v-if="kind === 'modelset'">
                <v-btn color="primary" small text @click="publishSet(item)">
                  {{ i18nLocal.t('operate.publish') }}
                </v-btn>
              </v-flex>
            </template>
            <v-flex>
              <v-btn color="primary" small text @click="editSet(item)">
                {{ i18n.t('operate.edit') }}
              </v-btn>
            </v-flex>
            <v-flex>
              <v-btn color="error" small text @click="removeSet(item)">
                {{ i18n.t('operate.delete') }}
              </v-btn>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-menu>
      <div class="text-h6 primary--text">
        <v-menu
          v-if="item.name.length > 30"
          bottom
          :close-delay="200"
          max-width="350"
          min-width="80"
          open-on-hover
          right
        >
          <template #activator="{ on }">
            <div class="float-left card__name" v-on="on">
              {{ item.displayName || item.name }}
            </div>
          </template>
          <v-card>
            <v-card-text class="pa-3 text-body-2"> {{ item.displayName || item.name }} </v-card-text>
          </v-card>
        </v-menu>
        <div v-else class="float-left card__name">
          {{ item.displayName || item.name }}
        </div>

        <div class="float-left text-caption status">
          <JobStatusTip
            v-if="getStatus(item) !== 'Succeeded' && getDownloader(item)"
            :downloader="getDownloader(item)"
            :name="item.name"
            :tenant="item.tenant"
          >
            <template #trigger>
              <div class="orange white--text status__tip">
                {{ i18nLocal.t('status.doing') }}
                <v-icon
                  :class="{
                    'mr-1': true,
                    'kubegems__waiting-circle-flashing': true,
                  }"
                  color="white"
                  small
                >
                  mdi-loading
                </v-icon>
              </div>
            </template>
          </JobStatusTip>
        </div>
        <div class="kubegems__clear-float" />
      </div>
      <div class="text-caption">
        From <strong>{{ item.source || 'default' }}</strong>
        <template v-if="applyFor === 'panel'">
          Tenant <strong>{{ item.tenant }}</strong>
        </template>
      </div>
      <div class="mb-2 text-caption">
        <div class="float-left">
          {{ moment(item.updatedAt || item.lastModified).format('YYYY-MM-DD HH:mm:ss') }} By
          {{ item.creator }}
        </div>
        <div class="kubegems__clear-float" />
      </div>

      <v-divider />
      <v-list-item class="px-0 mt-2">
        <v-list-item-avatar class="primary--text" size="57" tile>
          <BaseLogo default-logo="pai" :icon-name="getIcon(item)" :width="50" />
        </v-list-item-avatar>
        <v-list-item-content class="card__content">
          {{ item.description }}
        </v-list-item-content>
      </v-list-item>

      <v-card-actions class="px-0">
        <v-menu v-if="applyFor === 'self'" :close-delay="200" max-width="350" min-width="80" open-on-hover right top>
          <template #activator="{ on }">
            <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc card__desc__wd" v-on="on">
              <v-icon color="orange" small>mdi-chart-donut</v-icon>
              Size: {{ item.status.size || 0 }}
              <span class="mx-2" />
            </v-list-item-subtitle>
            <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc card__desc__wd" v-on="on">
              <v-icon color="orange" small>mdi-bucket</v-icon>
              Objects: {{ item.status.count || 0 }}
              <span class="mx-2" />
            </v-list-item-subtitle>
          </template>
          <v-card>
            <v-card-text class="pa-3 text-body-2">
              {{ i18n.t('used') }}: {{ item.status.size }} /
              {{ item.config && item.config.capacity ? item.config.capacity : 0 }} ({{
                item.status.progress ? item.status.progress.toFixed(2) : 0
              }}%)
            </v-card-text>
          </v-card>
        </v-menu>

        <template v-else>
          <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
            <v-icon color="orange" small>mdi-chart-donut</v-icon>
            Size: {{ item.status.size || 0 }}
            <span class="mx-2" />
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc">
            <v-icon color="orange" small>mdi-bucket</v-icon>
            Objects: {{ item.status.count || 0 }}
            <span class="mx-2" />
          </v-list-item-subtitle>
        </template>

        <template
          v-if="getStatus(item) === 'Succeeded' || getStatus(item) === 'Stopped' || getStatus(item) === 'Paused'"
        >
          <v-list-item-subtitle class="text-body-2 text--lighten-4 card__desc text-end">
            <v-btn color="primary" small text @click="viewSet(item)">
              {{ i18nLocal.t('operate.view') }}
            </v-btn>
          </v-list-item-subtitle>
        </template>
      </v-card-actions>

      <v-progress-linear
        v-if="applyFor === 'self'"
        class="card__linear kubegems__pointer"
        :color="item.status.color"
        height="3"
        :value="item.status.progress"
      />
    </v-card>
  </v-hover>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { PAI_DATASET_CATALOG_KEY, PAI_MODALSET_CATALOG_KEY } from '@kubegems/libs/constants/label';
  import moment from 'moment';

  import { Downloader, SetBase } from '../../api/base';
  import { useI18n } from './i18n';
  import JobStatusTip from './JobStatusTip.vue';

  const props = withDefaults(
    defineProps<{
      item?: any | SetBase;
      kind?: string;
      applyFor?: string;
    }>(),
    {
      item: () => {
        return {};
      },
      kind: void 0,
      applyFor: 'panel',
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const getIcon = (item: any): string => {
    if (props.kind === 'modelset') {
      return item?.labels[PAI_MODALSET_CATALOG_KEY] || 'modelgeneric';
    } else {
      return item?.labels[PAI_DATASET_CATALOG_KEY] || 'mdi:database';
    }
  };

  const emit = defineEmits(['viewSet', 'editSet', 'removeSet', 'publicSet', 'publishSet', 'privateSet']);
  const viewSet = (item: SetBase): void => {
    emit('viewSet', item);
  };

  const editSet = (item: SetBase): void => {
    emit('editSet', item);
  };

  const removeSet = (item: SetBase): void => {
    emit('removeSet', item);
  };

  const publicSet = (item: SetBase): void => {
    emit('publicSet', item);
  };

  const publishSet = (item: SetBase): void => {
    emit('publishSet', item);
  };

  const privateSet = (item: SetBase): void => {
    emit('privateSet', item);
  };

  const getStatus = (item: SetBase): string => {
    //completed
    const [download] = item.downloaders;
    if (download) {
      return download.phase;
    }
    return 'Unknown';
  };

  const getDownloader = (item: SetBase): Downloader => {
    const [download] = item.downloaders;
    return download || void 0;
  };
</script>

<style lang="scss" scoped>
  .card {
    position: relative;

    &__linear {
      position: absolute;
      left: 0;
      bottom: 0;
    }

    &__name {
      white-space: nowrap;
      overflow: auto;
      word-break: break-word;
      text-overflow: ellipsis;
      max-width: 72%;
    }

    &__title {
      word-break: break-word;
      white-space: break-spaces;
      font-weight: bold;
      min-height: 38px;
      max-height: 57px;
    }

    &__scroll {
      &__loading {
        position: relative;
        height: 70px;
      }
    }

    &__desc {
      line-height: 24px;
    }

    &__content {
      max-height: 72px;
      overflow: auto;
      white-space: normal;
      word-break: break-word;
      font-size: 15px;
      color: rgba(0, 0, 0, 0.6);
      line-height: 22px;
    }
  }

  .status {
    margin-top: 4px;
    margin-left: 4px;

    &__tip {
      padding: 2px;
      padding-left: 4px;
      border-radius: 3px;
    }
  }

  .watermark {
    position: absolute;
    color: grey;
    opacity: 0.5;
    font-size: 1rem;
    rotate: -35deg;
    font-weight: 300;
    text-shadow: 0 0 2px #444444;
  }
</style>
