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
    <BaseBreadcrumb />

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
                <v-btn color="primary" text @click="addImage">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ i18n.t('operate.create_c', [i18nLocal.t('resource.opensource')]) }}
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-card-title>
      <v-card-text>
        <v-data-table
          disable-sort
          :headers="headers"
          hide-default-footer
          :items="pagination.items"
          :items-per-page="pagination.size"
          :no-data-text="i18n.t('data.no_data')"
          :page.sync="pagination.page"
        >
          <template #item.name="{ item }">
            <div class="primary--text text-subtitle-2 font-weight-medium">{{ item.name }}</div>
            <div class="text-caption kubegems__text">{{ item.description || '-' }}</div>
          </template>
          <template #item.for="{ item }">
            {{ i18nLocal.t(`tip.${item.labels ? item.labels.for : 'generic'}`) }}
          </template>
          <template #item.framework="{ item }">
            <div class="float-left">
              <BaseLogo
                class="mr-2"
                :color="store.state.ThemeColor"
                default-logo="none"
                :icon-name="item.labels ? item.labels.framework : '-'"
                :ml="0"
                :mt="1"
                :width="20"
              />
            </div>
            <div class="float-left table__icon">
              {{ item.labels ? item.labels.framework : '-' }}
            </div>
            <div class="kubegems__clear-float" />
          </template>
          <template #item.version="{ item }">
            {{ item.labels ? item.labels.python : '-' }}
          </template>
          <template #item.os="{ item }">
            <div class="float-left">
              <BaseLogo
                class="mr-2"
                :color="store.state.ThemeColor"
                default-logo="none"
                :icon-name="item.labels ? item.labels.os : '-'"
                :ml="0"
                :mt="1"
                :width="20"
              />
            </div>
            <div class="float-left table__icon">
              {{ item.labels ? item.labels.os : '-' }}
            </div>
            <div class="kubegems__clear-float" />
          </template>
          <template #item.processor="{ item }">
            {{ item.labels ? item.labels.processor : '-' }}
          </template>
          <template #item.cuda="{ item }">
            {{ item.cuda ? item.labels.cuda : '-' }}
          </template>
          <template #item.action="{ item, index }">
            <v-flex :id="`r-image${index}`" />
            <v-menu :attach="`#r-image${index}`" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateImage(item)">
                      {{ i18n.t('operate.edit') }}
                    </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeImage(item)">
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
        />
      </v-card-text>
    </v-card>

    <ImageForm ref="image" @refresh="getImageList" />
  </v-container>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { sleep } from '@kubegems/libs/utils/helpers';
  import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
  import { useRequest } from 'vue-request';

  import { Image } from '../../api/image';
  import { usePreCheck } from '../../hooks/precheck';
  import ImageForm from './components/ImageForm.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const query = useQuery();

  const headers = computed(() => {
    const items = [
      { text: i18nLocal.t('table.name'), value: 'name', align: 'start' },
      { text: i18nLocal.t('table.framework'), value: 'framework', align: 'start' },
      { text: i18nLocal.t('table.cuda'), value: 'cuda', align: 'start' },
      { text: i18nLocal.t('table.for'), value: 'for', align: 'start' },
      { text: i18nLocal.t('table.version'), value: 'version', align: 'start' },
      { text: i18nLocal.t('table.os'), value: 'os', align: 'start' },
      { text: i18nLocal.t('table.processor'), value: 'processor', align: 'start' },
      { text: i18nLocal.t('table.address'), value: 'image', align: 'start' },
      { text: '', value: 'action', align: 'center', width: 20 },
    ];
    return items;
  });

  let pagination: Pagination<Image> = reactive<Pagination<Image>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
    search: '',
    noprocessing: false,
  });

  const getImageList = async (): Promise<void> => {
    const data = await new Image().getPublicImageList({ noprocessing: pagination.noprocessing });
    pagination.items = data;
    itemsCopy.value = data;
    pagination.pageCount = Math.ceil(data.length / pagination.size);
  };

  const filters = [{ text: i18nLocal.t('filter.name'), value: 'search', items: [] }];
  const itemsCopy = ref([]);
  const customFilter = () => {
    if (query.value.search) {
      pagination.items = itemsCopy.value.filter((item) => {
        return item.name && item.name.toLocaleLowerCase().indexOf(query.value.search.toLocaleLowerCase()) > -1;
      });
    } else {
      pagination.items = itemsCopy.value;
    }
  };

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  onMounted(() => {
    if (!usePreCheck()) return;
    const { cancel } = useRequest(getImageList, {
      pollingInterval: 1000 * 30,
      onSuccess: () => {
        pagination.noprocessing = true;
      },
    });
    _cancel = cancel;
  });

  onUnmounted(() => {
    if (_cancel) _cancel();
  });

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const image = ref(null);
  const addImage = (): void => {
    image.value.open(true);
  };

  const updateImage = (item: Image): void => {
    image.value.init(item, true);
    image.value.open(true);
  };

  const removeImage = (item: Image): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('resource.opensource')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('resource.opensource')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new Image(param.item).deletePublicImage();
          await sleep(500);
          getImageList();
        }
      },
    });
  };
</script>

<style lang="scss" scoped>
  .table {
    &__icon {
      line-height: 28px;
    }
  }
</style>
