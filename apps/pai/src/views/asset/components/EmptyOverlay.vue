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
  <transition name="fade">
    <v-flex v-if="visible" class="empty-overlay mt-3">
      <slot>{{ text }}</slot>
    </v-flex>
  </transition>
</template>

<script lang="ts" setup>
  withDefaults(
    defineProps<{
      text?: string;
      visible?: boolean;
    }>(),
    {
      text: '',
      visible: false,
    },
  );
</script>

<style lang="scss" scoped>
  .empty-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 45px;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    background-color: rgba(#ffffff, 1);
    backdrop-filter: blur(2px);
    color: $primary;
    font-size: 1.2rem;
    font-weight: 600;
  }
</style>
