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
  <v-card class="rounded-tr-0 rounded-tl-0 mb-3" flat height="60">
    <v-card-title class="py-3 mt-n3" :style="{ height: `60px` }">
      <v-sheet v-if="selectable" class="text-subtitle-1">
        {{ i18n.t('resource.region') }}
        <v-menu
          v-model="state.menu"
          bottom
          :close-on-content-click="false"
          content-class="header__menu"
          max-height="350px"
          :min-width="state.width"
          nudge-bottom="5px"
          offset-y
          origin="top center"
          right
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <v-btn
              class="primary--text text-subtitle-1 font-weight-medium mt-n1"
              color="white"
              dark
              depressed
              small
              v-on="on"
              @click="fillData"
            >
              <BaseLogo class="mr-2 logo" default-logo="kubernetes" icon-name="mdi:map" :ml="0" :width="20" />
              {{ store.getters.Region().RegionName }}
              <v-icon v-if="state.menu" right>mdi-chevron-up</v-icon>
              <v-icon v-else right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-card class="pa-2" flat height="350px">
            <div class="select__left" :style="{ width: '220px' }">
              <div class="text-subtitle-2 kubegems__text select__title">
                <div class="float-left"> {{ i18n.t('tip.select_one_region') }} </div>
                <div v-if="state.loading" class="float-right">
                  <v-progress-circular color="primary" indeterminate size="18" width="3" />
                </div>
                <div class="kubegems__clear-float" />
              </div>
              <div class="text-caption pa-1 mt-2">{{ i18n.t('resource.region') }}</div>
              <v-divider class="mb-2" />
              <v-list class="pa-0" dense max-height="300" nav :style="{ overflowY: 'auto' }">
                <v-list-item-group v-model="state.region" color="primary" @change="selectRegion">
                  <v-list-item v-for="item in store.state.pai.RegionStore" :key="item.value" dense>
                    <v-list-item-avatar class="mr-0" size="28">
                      <BaseLogo default-logo="kubernetes" icon-name="mdi:map" :ml="0" :mt="1" :width="20" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title class="select__list__title pl-2">
                        {{ item.name }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </div>
            <div class="kubegems__clear-float" />
          </v-card>
        </v-menu>
      </v-sheet>
      <v-sheet v-else class="text-subtitle-1">
        {{ i18n.t('resource.region') }}
        <v-btn
          class="primary--text text-subtitle-1 font-weight-medium mt-n1"
          color="white"
          dark
          depressed
          small
          @click.stop
        >
          <BaseLogo class="mr-2 logo" default-logo="kubernetes" icon-name="mdi:map" :ml="0" :width="20" />
          {{ store.getters.Region().RegionName }}
        </v-btn>
      </v-sheet>
      <v-spacer />
      <v-sheet v-if="!meta.admin">
        <span class="text-body-2 kubegems__text">
          <span class="ml-4">{{ i18n.t('resource.tenant') }} : {{ store.getters.Tenant().TenantName }}</span>
        </span>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useMeta, useParams, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { inject, reactive } from 'vue';

  import { Tenant } from '../api/tenant';

  withDefaults(
    defineProps<{
      selectable?: boolean;
    }>(),
    {
      selectable: true,
    },
  );

  const i18n = useGlobalI18n();
  const store = useStore();
  const router = useRouter();
  const meta = useMeta();
  const query = useQuery();
  type reloadHandler = () => void;
  const reload: reloadHandler = inject('reload') as reloadHandler;
  const state = reactive<any>({
    menu: false,
    search: void 0,
    width: 220,
    region: void 0,
    loading: false,
  });

  const params = useParams();
  const fillData = async (): Promise<void> => {
    state.loading = true;
    await store.dispatch('UPDATE_REGION_DATA');
    state.loading = false;
    state.region = store.state.pai.RegionStore.findIndex((r) => {
      return r.name === params.value.region;
    });
  };

  const selectRegion = async (): Promise<void> => {
    if (state.region > -1) {
      const data = await new Tenant({ name: store.getters.Tenant().TenantName }).getRegionStatusInTenant(
        store.state.pai.RegionStore[state.region]?.name,
      );
      store.commit('SET_QUEUE', data.enabled);
      await router.replace({
        params: { region: store.state.pai.RegionStore[state.region]?.name || '' },
        query: { ...query.value, page: '1' },
      });
      await store.dispatch('UPDATE_REGION_DATA');
      reload();
    }
  };
</script>

<style lang="scss" scoped>
  .header {
    &__menu {
      z-index: auto !important;
    }
  }

  .select {
    &__left {
      float: left;
      padding: 8px;
    }

    &__right {
      float: left;
      padding: 8px;
    }

    &__title {
      line-height: 28px;
      font-weight: 500 !important;
    }

    &__divider {
      min-height: 100%;
      max-height: 100%;
    }

    &__list {
      &__title {
        white-space: inherit !important;
        word-break: break-all !important;

        > div {
          line-height: 24px;
        }
      }

      &__badge {
        background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
        padding: 0 4px;
        margin-top: 2px;
      }
    }
  }

  .logo {
    margin-top: 6px !important;
  }
</style>
