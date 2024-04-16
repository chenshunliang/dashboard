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
  <v-flex>
    <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1">
      <span class="text-body-2 mt-0 mr-1">{{ i18nLocal.t('tip.region') }}</span>
      <v-menu
        v-model="state.menu"
        bottom
        class="mx-1 px-1"
        left
        offset-y
        origin="top center"
        transition="scale-transition"
      >
        <template #activator="{ on }">
          <v-btn class="primary--text font-weight-medium" color="white" text v-on="on">
            {{ region ? region.name : '' }}
            <v-icon v-if="state.menu" right> mdi-chevron-up </v-icon>
            <v-icon v-else right> mdi-chevron-down </v-icon>
          </v-btn>
        </template>
        <v-data-iterator
          class="file-iterator"
          hide-default-footer
          :items="[{ text: i18nLocal.t('tip.region'), values: regionItems }]"
        >
          <template #no-data>
            <v-card>
              <v-card-text> {{ i18n.t('data.no_data') }} </v-card-text>
            </v-card>
          </template>
          <template #default="props">
            <v-card v-for="item in props.items" :key="item.text" flat min-width="120">
              <v-list dense>
                <v-flex class="text-subtitle-2 text-center ma-2">
                  <span>{{ i18nLocal.t('tip.region') }}</span>
                </v-flex>
                <v-divider class="mx-2" />
                <v-list-item
                  v-for="(reg, index) in item.values"
                  :key="index"
                  class="text-body-2 text-center font-weight-medium kubegems__text mx-2"
                  link
                  :style="{ color: reg.name === region.name ? `var(--primary-color) !important` : `` }"
                  @click="setRegion(reg)"
                >
                  <v-list-item-content>
                    <span>{{ reg.name }}</span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </template>
        </v-data-iterator>
      </v-menu>
    </v-sheet>
  </v-flex>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { computed, reactive, ref, watch } from 'vue';

  import { Region } from '../../api/region';
  import { useI18n } from './i18n';

  const props = withDefaults(
    defineProps<{
      value: Region;
    }>(),
    {
      value: void 0,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    menu: false,
  });

  const region = ref<Region>(void 0);
  const regionItems = computed(() => {
    return store.state.pai.RegionStore;
  });

  const emit = defineEmits(['input', 'change']);
  const setRegion = (reg: Region): void => {
    region.value = reg;
    emit('input', reg);
    emit('change', reg);
    state.menu = false;
  };

  watch(
    () => props.value,
    (newValue) => {
      if (newValue) {
        region.value = newValue;
      } else {
        const [_reg] = store.state.pai.RegionStore;
        region.value = _reg;
      }
      emit('input', region.value);
      emit('change', region.value);
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>
