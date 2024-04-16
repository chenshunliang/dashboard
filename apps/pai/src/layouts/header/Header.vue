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
  <v-app-bar app class="header" clipped-left clipped-right color="primary" dark>
    <v-app-bar-nav-icon
      v-if="showAppBarNavIcon"
      @click="vuetify.breakpoint.smAndDown ? setSidebarDrawer(!store.state.SidebarDrawer) : emit('input', !value)"
    />

    <div>
      <div class="hidden-sm-and-down float-left">
        <v-img class="kubegems__absolute-middle" contain :src="config.layout.LOGO_WHITE" width="140" />
      </div>
      <div
        class="pl-2 text-h6 float-left header__line-height"
        :style="{
          fontFamily: 'kubegems-sample !important',
          fontSize: `1.5rem !important`,
          marginLeft: `140px`,
        }"
      >
        {{ smallTitle }}
      </div>

      <div class="kubegems__clear-float" />
    </div>

    <v-spacer />

    <User />
  </v-app-bar>
</template>

<script lang="ts" setup>
  import { useVuetify } from '@kubegems/extension/proxy';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';

  import User from './User.vue';

  withDefaults(
    defineProps<{
      showAppBarNavIcon?: boolean;
      smallTitle?: string;
      value?: boolean;
    }>(),
    {
      showAppBarNavIcon: true,
      smallTitle: '',
      value: false,
    },
  );

  const store = useStore();
  const vuetify = useVuetify();

  const setSidebarDrawer = (sidebar: any): void => {
    store.commit('SET_SIDEBAR_DRAWER', sidebar);
  };

  const emit = defineEmits(['input']);
</script>

<style lang="scss" scoped>
  .header {
    z-index: 9;

    &__line-height {
      line-height: 64px !important;
    }

    &__icon-line-height {
      line-height: 20px !important;
    }

    &__span-line-height {
      line-height: 22px !important;
    }

    &__bg {
      z-index: 9999 !important;
    }

    &__highlight {
      color: var(--primary-color) !important;
    }
  }
</style>
