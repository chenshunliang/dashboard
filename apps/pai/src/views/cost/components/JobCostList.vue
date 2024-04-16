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
  <v-card>
    <BaseSubTitle :divider="false" :title="i18nLocal.t('tip.training_cost')" />
    <v-data-table
      class="mx-4"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="pagination.items"
      :items-per-page="pagination.size"
      :no-data-text="i18n.t('data.no_data')"
      :page.sync="pagination.page"
    />

    <BasePagination
      v-if="pagination.pageCount >= 1"
      v-model="pagination.page"
      :page-count="pagination.pageCount"
      :size="pagination.size"
      @changepage="pageChange"
      @changesize="sizeChange"
      @loaddata="getJobCostList"
    />
  </v-card>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { reactive } from 'vue';

  import { Job } from '../../../api/job';
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const headers = [
    { text: i18nLocal.t('table.time'), value: 'time', align: 'start' },
    { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.type'), value: 'type', align: 'start' },
    { text: i18nLocal.t('table.instance'), value: 'instance', align: 'start' },
    { text: i18nLocal.t('table.gpu_used'), value: 'gpuUsed', align: 'start' },
    { text: i18nLocal.t('table.cpu_used'), value: 'cpuUsed', align: 'start' },
    { text: i18nLocal.t('table.traffic'), value: 'traffic', align: 'start' },
    { text: i18nLocal.t('table.total_cost'), value: 'cost', align: 'start' },
    { text: i18nLocal.t('table.expired'), value: 'expired', align: 'start' },
    { text: i18nLocal.t('table.creator'), value: 'creator', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  let pagination: Pagination<Job> = reactive<Pagination<Job>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
  });

  const getJobCostList = () => {
    return;
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };
</script>
