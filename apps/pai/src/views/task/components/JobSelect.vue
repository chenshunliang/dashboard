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
  <v-menu
    v-model="state.menu"
    bottom
    close-on-click
    :close-on-content-click="false"
    max-height="350px"
    max-width="450px"
    min-width="200px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <div class="float-left">
        <v-btn
          class="mr-2 mt-1 font-weight-medium primary--text"
          color="white"
          dark
          depressed
          small
          :style="{ marginTop: `${0}px` }"
          v-on="on"
        >
          Job: {{ pod ? pod.metadata.name : '' }}
          <v-icon v-if="state.menu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
      </div>
    </template>
    <v-card class="pa-2 py-3" flat height="350px">
      <div class="select__div" :style="{ width: '100%' }">
        <div class="text-caption pa-1 mt-2">Job</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="250" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="idx" color="primary">
            <v-list-item v-for="(item, index) in pods" :key="index" dense>
              <v-list-item-content @click="selectJob(item)">
                <v-list-item-title class="select__list__title">
                  {{ item.metadata.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <div class="kubegems__clear-float" />
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { Pod } from '@kubegems/api/typed/pod';
  import { reactive, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      pods?: Pod[];
    }>(),
    {
      pods: void 0,
    },
  );

  const state = reactive({
    menu: false,
  });

  const idx = ref(0);

  const pod = ref<Pod>(void 0);
  const emit = defineEmits(['input', 'change']);
  const selectJob = (item: Pod) => {
    state.menu = false;
    pod.value = item;
    emit('input', item);
    emit('change', item);
  };

  watch(
    () => props.pods,
    (newValue) => {
      if (newValue?.length > 0) {
        pod.value = newValue[0];
        emit('input', newValue[0]);
        emit('change', newValue[0]);
      }
    },
    { deep: true, immediate: true },
  );
</script>

<style lang="scss" scoped>
  .select {
    &__div {
      float: left;
      width: 50%;
      padding: 8px;
    }

    &__title {
      line-height: 28px;
      font-weight: 500 !important;
    }

    &__divider {
      min-height: 93%;
      max-height: 93%;
    }

    &__list {
      &__title {
        white-space: inherit !important;
        word-break: break-all !important;
      }
    }
  }
</style>
