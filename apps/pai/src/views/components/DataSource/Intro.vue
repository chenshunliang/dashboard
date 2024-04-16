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
  <div v-highlight class="markdown-body px-4">
    <component :is="componentValue" v-if="componentValue" />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  // @ts-ignore
  import HuggingFace from './huggingface.md';

  const props = withDefaults(
    defineProps<{
      component: string;
    }>(),
    {
      component: void 0,
    },
  );

  const componentItems = [{ text: 'HuggingFace', value: HuggingFace }];
  const componentValue = computed(() => {
    return (
      componentItems.find((c) => {
        return c.text === props.component;
      })?.value || void 0
    );
  });
</script>
