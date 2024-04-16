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
  <LayoutWithoutNavi>
    <template #header>
      <Header v-model="expandOnHover" :show-app-bar-nav-icon="false" :small-title="route.meta.smallTitle" />
    </template>
  </LayoutWithoutNavi>
</template>

<script lang="ts" setup>
  import LayoutWithoutNavi from '@kubegems/components/layouts/LayoutWithoutNavi.vue';
  import { useRoute } from '@kubegems/extension/proxy';
  import { ref } from 'vue';

  import Header from './header/Header.vue';

  const route = useRoute();

  const expandOnHover = ref(false);
</script>
