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
  <v-app id="gemsos" :class="`${!vuetify.breakpoint.smAndDown ? 'full-sidebar' : 'mini-sidebar'}`">
    <router-view v-if="isReloadAlive" />
    <BaseProgress :progress="config.layout.PLATFORM" />
    <BaseSnackBar />
    <BaseConfirm />
  </v-app>
</template>

<script lang="ts" setup>
  import { useVuetify } from '@kubegems/extension/proxy';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { nextTick, onMounted, provide, ref } from 'vue';

  const store = useStore();

  const isReloadAlive = ref<boolean>(true);
  const reload = (): void => {
    isReloadAlive.value = false;
    nextTick(() => {
      isReloadAlive.value = true;
    });
  };
  provide('reload', reload);

  const vuetify = useVuetify();
  const initScale = (): void => {
    let scale = 1.0;
    if (vuetify.breakpoint.name === 'lg') {
      if (window.innerWidth > 1440 && window.innerWidth < 1920) {
        scale = 0.9;
      } else if (window.innerWidth > 1280 && window.innerWidth <= 1440) {
        scale = 0.85;
      }
    } else if (vuetify.breakpoint.name === 'xl') {
      scale = 0.95;
    }
    document.getElementsByTagName('body')[0].style.cssText = `zoom: ${scale}`;
    store.commit('SET_SCALE', scale);
  };

  onMounted(() => {
    nextTick(() => {
      initScale();
    });
  });
</script>
