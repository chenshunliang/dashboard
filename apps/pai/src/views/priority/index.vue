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
  <v-container fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <RegionSelect v-model="region" />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card>
      <v-card-title class="py-4">
        <BaseFilter1
          :default="{ items: [], text: i18nLocal.t('filter.name'), value: 'search' }"
          :filters="filters"
          :reload="false"
          @filter="customFilter"
        />
        <v-spacer />
        <v-menu left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn color="primary" text @click="addPriority">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ i18n.t('operate.create_c', [i18nLocal.t('resource.priority')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-data-table
        class="mx-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.updatedAt="{ item }">
          {{ moment(item.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template #item.action="{ item, index }">
          <v-flex :id="`r-priority${index}`" />
          <v-menu :attach="`#r-priority${index}`" left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn color="error" small text @click="removePriority(item)">
                    {{ i18n.t('operate.delete') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-data-table>

      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :front-page="true"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getPriorityList"
      />
    </v-card>

    <PriorityForm ref="priority" :region="region" @refresh="getPriorityList" />
  </v-container>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import moment from 'moment';
  import { reactive, ref, watch } from 'vue';

  import { Priority } from '../../api/priority';
  import { usePreCheck } from '../../hooks/precheck';
  import RegionSelect from '../components/RegionSelect.vue';
  import PriorityForm from './components/PriorityForm.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.description'), value: 'description', align: 'start' },
    { text: i18nLocal.t('table.region'), value: 'region', align: 'start' },
    { text: i18nLocal.t('table.weight'), value: 'weight', align: 'start' },
    // { text: i18nLocal.t('table.creator'), value: 'creator', align: 'start' },
    { text: i18nLocal.t('table.update_at'), value: 'updatedAt', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<Priority> = reactive<Pagination<Priority>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });

  const getPriorityList = async (): Promise<void> => {
    const data = await new Priority({ region: region.value.name }).getPriorityList();
    pagination.items = data;
    itemsCopy.value = data;
    pagination.pageCount = Math.ceil(data.length / pagination.size);
  };

  const filters = [{ text: i18nLocal.t('filter.name'), value: 'search', items: [] }];
  const itemsCopy = ref([]);
  const query = useQuery();
  const customFilter = () => {
    if (query.value.search) {
      pagination.items = itemsCopy.value.filter((item) => {
        return item.name && item.name.toLocaleLowerCase().indexOf(query.value.search.toLocaleLowerCase()) > -1;
      });
    } else {
      pagination.items = itemsCopy.value;
    }
  };

  const region = ref(void 0);
  watch(
    () => region.value,
    (newValue) => {
      if (newValue) {
        if (!usePreCheck()) return;
        getPriorityList();
      }
    },
    { deep: true, immediate: true },
  );

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const priority = ref(null);
  const addPriority = (): void => {
    priority.value.open();
  };

  const removePriority = (item: Priority): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('resource.priority')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('resource.priority')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new Priority(param.item).deletePriority();
          getPriorityList();
        }
      },
    });
  };
</script>
