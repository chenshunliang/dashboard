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
  <div :style="{ height: `${height}px`, overflowY: `auto`, position: `relative` }">
    <v-data-table
      class="mx-4 kubegems__table-row-pointer"
      disable-sort
      :headers="headers"
      hide-default-footer
      item-key="index"
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
      show-expand
      single-expand
      @click:row="rowClick"
      @page-count="pagination.pageCount = $event"
    >
      <template #item.reason="{ item }">
        {{ item.stream.reason }}
      </template>
      <template #item.type="{ item }">
        <v-chip
          class="font-weight-medium chip-width"
          :color="item.stream.type === 'Normal' ? 'success' : 'warning'"
          small
        >
          <span>{{ item.stream.type }}</span>
        </v-chip>
      </template>
      <template #item.count="{ item }">
        {{ item.stream.count }}
      </template>
      <template #item.namespace="{ item }">
        {{ item.stream.metadata_namespace ? item.stream.metadata_namespace : '' }}
      </template>
      <template #item.name="{ item }">
        {{ item.stream.metadata_name ? item.stream.metadata_name : '' }}
      </template>
      <template #item.component="{ item }">
        {{ item.stream.source_component ? item.stream.source_component : '' }}
      </template>
      <template #item.host="{ item }">
        {{ item.stream.source_host ? item.stream.source_host : '' }}
      </template>
      <template #item.firstAt="{ item }">
        {{
          item.stream.firstTimestamp
            ? moment(item.stream.firstTimestamp).format('lll')
            : item.stream.metadata_creationTimestamp
            ? moment(item.stream.metadata_creationTimestamp).format('lll')
            : ''
        }}
      </template>
      <template #item.lastAt="{ item }">
        {{
          item.stream.lastTimestamp
            ? moment(item.stream.lastTimestamp).format('lll')
            : item.stream.metadata_creationTimestamp
            ? moment(item.stream.metadata_creationTimestamp).format('lll')
            : ''
        }}
      </template>
      <template #item.message="{ item }">
        {{ item.stream.message.length > 100 ? item.stream.message.substr(0, 100) + '......' : item.stream.message }}
      </template>
      <template #expanded-item="{ headers, item }">
        <td class="text-left" :colspan="headers.length">
          <pre class="kubegems__word-all-break">{{ item.stream.message }}</pre>
        </td>
      </template>
    </v-data-table>
    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :front-page="true"
      :page-count="pagination.pageCount"
      pid="page_event"
      :size="pagination.size"
      :visible-num="4"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="datetimeChanged"
    />
  </div>
</template>

<script lang="ts" setup>
  import moment from 'moment';
  import { ComputedRef, computed, reactive, watch } from 'vue';

  import { useI18n } from '../../../i18n';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';

  const props = withDefaults(
    defineProps<{
      data?: any[];
    }>(),
    {
      data: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const height: ComputedRef<number> = computed(() => {
    return parseInt(((window.innerHeight - 110) / store.state.Scale).toString());
  });

  const headers = [
    { text: i18nLocal.t('table.origin_component'), value: 'component', align: 'start', width: 150 },
    { text: i18nLocal.t('table.origin_host'), value: 'host', align: 'start', width: 250 },
    { text: i18n.t('resource.service'), value: 'name', align: 'start', width: 200 },
    { text: i18n.t('resource.namespace'), value: 'namespace', align: 'start', width: 150 },
    { text: i18n.t('resource.type'), value: 'type', align: 'start', width: 150 },
    { text: 'Reason', value: 'reason', align: 'start', width: 100 },
    { text: i18nLocal.t('table.message'), value: 'message', align: 'start', width: 200 },
    { text: i18nLocal.t('table.count'), value: 'count', align: 'start', width: 50 },
    { text: i18nLocal.t('table.first_at'), value: 'firstAt', align: 'start', width: 150 },
    { text: i18nLocal.t('table.last_at'), value: 'lastAt', align: 'start', width: 150 },
    { text: '', value: 'data-table-expand' },
  ];

  let pagination: Pagination<any> = reactive<Pagination<any>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const rowClick = (item, { expand, isExpanded }) => {
    expand(!isExpanded);
  };

  const emit = defineEmits(['loadData']);
  const datetimeChanged = () => {
    emit('loadData');
  };

  watch(
    () => props.data,
    async (newValue) => {
      if (!newValue) return;
      const itemIndex = pagination.items.length;
      const items = newValue.map((event, index) => {
        return {
          index: itemIndex + index,
          ...event,
        };
      });
      items.sort((a, b) => {
        return parseInt(b.values[0].toString()) - parseInt(a.values[0].toString());
      });
      pagination.items = items;
    },
    { deep: true, immediate: true },
  );
</script>
