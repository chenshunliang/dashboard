<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <v-dialog v-model="dialog" height="100%" :max-width="dialogWidth" :overlay-opacity="0.3" persistent scrollable>
    <v-card :min-height="minHeight">
      <v-sheet class="px-4 py-2 primary">
        <div class="justify-center float-left text-h6 py-1 white--text">
          <v-icon class="mt-n1 white--text" left>{{ icon }}</v-icon>
          {{ title }}
          <div
            v-if="store.state.Progress"
            :style="{
              position: 'absolute',
              right: '15px',
              top: '12px',
            }"
          >
            <v-progress-circular color="white" indeterminate size="20" width="3" />
          </div>
        </div>
        <div class="float-left">
          <slot name="header-action" />
        </div>
        <div class="kubegems__clear-float" />
      </v-sheet>
      <v-card-text class="pa-0">
        <v-container class="cover__container" :style="{ display: intro ? 'flex' : 'block' }">
          <div :style="{ width: intro ? `${width}px` : '' }">
            <slot name="content" />
          </div>
          <div v-if="intro" :style="{ width: `${introWidth}px`, maxHeight: '700px', overflowY: 'auto' }">
            <slot name="intro" />
          </div>
        </v-container>
      </v-card-text>
      <div class="px-4 py-2">
        <slot name="action" />
        <v-btn class="float-right mx-2" color="error" text @click="close">
          {{ $slots.action ? i18n.t('operate.cancel') : i18n.t('operate.close') }}
        </v-btn>
        <div class="kubegems__clear-float" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { computed, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      icon?: string;
      minHeight?: number;
      title?: string;
      width?: number;
      value: boolean;
      intro?: boolean;
      introWidth?: number;
    }>(),
    {
      icon: '',
      minHeight: undefined,
      title: '',
      width: 800,
      value: false,
      intro: false,
      introWidth: 500,
    },
  );

  const store = useStore();
  const i18n = useGlobalI18n();

  const dialogWidth = computed(() => {
    if (props.intro) {
      return props.width + props.introWidth;
    }
    return props.width;
  });

  const dialog = ref<boolean>(false);
  const emit = defineEmits(['reset', 'input']);
  const close = (): void => {
    emit('reset');
    store.commit('SET_DIALOG', false);
    dialog.value = false;
    emit('input', false);
  };

  watch(
    () => props.value,
    async (newValue) => {
      if (newValue !== undefined) {
        store.commit('SET_DIALOG', newValue);
        dialog.value = newValue;
      }
    },
    { deep: true },
  );
</script>

<style lang="scss" scoped>
  @media (min-width: 1264px) {
    .cover__container {
      max-width: 1600px !important;
    }
  }
</style>
