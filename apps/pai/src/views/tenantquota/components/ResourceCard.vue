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
  <v-card class="primary--text kubegems__pointer" flat theme="dark">
    <v-card-title class="text-h6"> {{ title }} </v-card-title>

    <v-card-subtitle class="pt-3 text-h6">
      <v-btn class="elevation-0 mr-2" color="primary" dark fab small>
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
      {{ subtitle }}
    </v-card-subtitle>
  </v-card>
</template>

<script lang="ts" setup>
  withDefaults(
    defineProps<{
      title: string;
      subtitle: string;
      icon: string;
    }>(),
    {
      title: '',
      subtitle: '',
      icon: '',
    },
  );
</script>
