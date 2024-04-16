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
  <div>
    <v-system-bar
      v-if="store.state.Broadcast.length > 0"
      class="white--text text-subtitle-1 font-weight-medium mx-3 rounded-b"
      color="orange lighten-2"
      height="48"
    >
      <div class="text-start" :style="{ width: '100%' }">
        <span v-for="(item, index) in store.state.Broadcast" :key="index" class="px-1">
          <v-icon color="white">mdi-volume-high</v-icon>
          <span class="ml-2" v-html="parseLink(item.message)" />
        </span>
      </div>
    </v-system-bar>
    <router-view />
  </div>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import { onMounted } from 'vue';

  onMounted(() => {
    store.dispatch('INIT_BROADCAST');
  });

  const store = useStore();
  const parseLink = (message: string): string => {
    const reg = new RegExp('(https?[\\/:\\.\\-_&\\?\\w=]*)', 'g');
    return message.replaceAll(
      reg,
      `<a href="$1" target="_blank" style="text-decoration: underline;color: white;">$1</a>`,
    );
  };
</script>
