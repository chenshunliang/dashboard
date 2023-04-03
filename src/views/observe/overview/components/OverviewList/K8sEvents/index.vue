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
  <BasePanel v-model="state.panel" icon="mdi-bell" :title="i18nLocal.t('tip.event')" @dispose="dispose">
    <template #action>
      <BaseDatetimePicker v-model="date" color="primary" :default-value="60" @change="datetimeChanged" />
    </template>
    <template #content>
      <v-tabs v-model="tab" class="rounded-t pa-0 v-tabs--default" fixed-tabs height="45">
        <v-tab v-for="t in tabItems" :key="t.key">
          {{ t.text }}
        </v-tab>
      </v-tabs>
      <div class="d-flex flex-column mt-0">
        <component :is="tabItems[tab].value" v-if="matrics" :data="matrics" :date="date" @loadData="getEventList" />
      </div>
    </template>
  </BasePanel>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../../i18n';
  import Chart from './Chart/index.vue';
  import EventList from './EventList.vue';
  import { Log } from '@/types/log';

  const props = withDefaults(
    defineProps<{
      env?: { clusterName: string; namespace: string };
    }>(),
    {
      env: undefined,
    },
  );

  const i18nLocal = useI18n();

  const state = reactive({
    panel: false,
  });

  const tab = ref<number>(0);
  const tabItems = [
    { text: i18nLocal.t('tab.event_chart'), value: Chart, key: 'chart' },
    { text: i18nLocal.t('tab.event_list'), value: EventList, key: 'event' },
  ];

  const date = ref([]);
  const matrics = ref([]);
  const getEventList = async (): Promise<void> => {
    let query = '{container="event-exporter", stream="stdout"} | json | __error__=``';
    query += ` | line_format "{{.metadata_namespace}}" |= "${props.env.namespace}"`;
    const data = await new Log().getEventList(props.env.clusterName, {
      query: query,
      limit: 3000,
      start: `${date.value[0]}000000`,
      end: `${date.value[1]}000000`,
    });
    matrics.value = data || [];
  };

  const datetimeChanged = () => {
    getEventList();
  };

  const open = (): void => {
    state.panel = true;
  };
  defineExpose({
    open,
  });

  const emit = defineEmits(['clear']);
  const dispose = (): void => {
    matrics.value = [];
    emit('clear');
  };
</script>
