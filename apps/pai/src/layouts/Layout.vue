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
  <Layout>
    <template #header>
      <Header v-model="expandOnHover" small-title="PAI" />
    </template>
    <template #sidebar>
      <Sidebar
        :key="store.state.SidebarKey"
        :expand-on-hover.sync="expandOnHover"
        :routes="useRoutes()"
        :sidebar-items="SIDEBAR_ITEMS"
      />
    </template>
  </Layout>
</template>

<script lang="ts" setup>
  import Layout from '@kubegems/components/layouts/Layout.vue';
  import Sidebar from '@kubegems/components/layouts/Sidebar.vue';
  import { useStore } from '@kubegems/extension/store';
  import { ref } from 'vue';

  import { useRoutes } from '../router';
  import { SIDEBAR_ITEMS } from '../sidebar';
  import Header from './header/Header.vue';

  const store = useStore();

  const expandOnHover = ref(false);
</script>
