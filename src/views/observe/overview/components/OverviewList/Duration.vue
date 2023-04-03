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
  <v-menu v-model="state.menu" bottom class="mx-1 px-1" left offset-y origin="top center" transition="scale-transition">
    <template #activator="{ on }">
      <v-btn
        :class="reverse ? `white--text font-weight-medium primary` : `primary--text font-weight-medium white`"
        dark
        depressed
        small
        text
        v-on="on"
      >
        {{ durationText }}
        <v-icon v-if="state.menu" right> mdi-chevron-up </v-icon>
        <v-icon v-else right> mdi-chevron-down </v-icon>
      </v-btn>
    </template>
    <v-data-iterator
      class="file-iterator"
      hide-default-footer
      :items="[{ text: i18nLocal.t('tip.time'), values: durationItems }]"
    >
      <template #no-data>
        <v-card>
          <v-card-text> {{ i18n.t('data.no_data') }} </v-card-text>
        </v-card>
      </template>
      <template #default="props">
        <v-card v-for="item in props.items" :key="item.text" flat>
          <v-list dense>
            <v-flex class="text-subtitle-2 text-center ma-2">
              <span>{{ i18nLocal.t('tip.time') }}</span>
            </v-flex>
            <v-divider class="mx-2" />
            <v-list-item
              v-for="(dur, index) in item.values"
              :key="index"
              class="text-caption text-center font-weight-medium mx-2"
              link
              :style="{ color: dur.value === duration ? `#1e88e5 !important` : `` }"
              @click="setDuration(dur)"
            >
              <v-list-item-content>
                <span>{{ dur.text }}</span>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </template>
    </v-data-iterator>
  </v-menu>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue';

  import messages, { useI18n } from '../../i18n';
  import { useGlobalI18n } from '@/i18n';

  const props = withDefaults(
    defineProps<{
      reverse?: boolean;
      value: any;
    }>(),
    {
      reverse: false,
      value: undefined,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const state = reactive({
    menu: false,
  });

  const duration = ref<string>('1h');
  const durationItems = [
    { text: i18nLocal.t('tip.last_30_second'), value: '30s' },
    { text: i18nLocal.t('tip.last_5_minute'), value: '5m' },
    { text: i18nLocal.t('tip.last_1_hour'), value: '1h' },
    { text: i18nLocal.t('tip.last_1_day'), value: '1d' },
    { text: i18nLocal.t('tip.last_1_week'), value: '1w' },
  ];

  const durationText = computed(() => {
    return durationItems.find((d) => {
      return d.value === duration.value;
    })?.text;
  });

  const emit = defineEmits(['input', 'change']);
  const setDuration = (dur): void => {
    if (dur.value !== duration.value) {
      duration.value = dur.value;
      emit('input', duration.value);
      emit('change', duration.value);
    }
  };

  watch(
    () => props.value,
    async (newValue) => {
      if (!newValue) return;
      duration.value = newValue;
    },
    { deep: true },
  );
</script>
