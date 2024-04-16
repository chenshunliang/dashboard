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
    :close-on-click="false"
    :close-on-content-click="false"
    left
    min-width="1160px"
    nudge-right="12"
    nudge-top="500"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="on">
      <v-row class="mt-0">
        <v-col v-if="value" class="pt-0" cols="6">
          <v-hover #default="{ hover }">
            <v-card class="kubegems__pointer image image__pos" :elevation="hover ? 2 : 0" flat v-on="on">
              <v-list-item three-line>
                <v-list-item-content>
                  <v-list-item-title class="text-body-2 kubegems__pointer">
                    <v-icon color="primary" left>mdi-box-shadow</v-icon>
                    {{ image.public ? i18nLocal.t('tip.public') : i18nLocal.t('tip.self') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="text-body-2"> {{ image.image || props.value }} </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-flex class="image__watermark-bg" />
              <v-flex class="image__watermark font-weight-medium">
                {{ i18nLocal.t('tip.image') }}
              </v-flex>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
      <v-flex class="grey lighten-4 rounded mt-3">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-2 py-0 text-center">
              <v-btn color="primary" text @click="open">
                <v-icon left small> mdi-box-shadow </v-icon>
                {{ i18nLocal.t('operate.image_conf') }}
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </template>
    <v-card>
      <v-card-text class="pa-2 py-3">
        <BaseSubTitle :title="i18nLocal.t('tip.image_conf')" />
        <v-data-table
          v-model="selected"
          class="mx-2 mt-2 pa-2 rounded table image__table"
          dense
          disable-sort
          :footer-props="{
            'items-per-page-options': [10, 20],
            'items-per-page-text': i18nLocal.t('tip.per_page'),
          }"
          :headers="headers"
          item-key="id"
          item-selected="image"
          :items="imageItems"
          :items-per-page="10"
          show-select
          single-select
        >
          <template #no-data>
            <span v-if="search">
              {{ i18nLocal.t('tip.no_search_data') }}
              <span class="orange--text">{{ i18nLocal.t('tip.create_on_enter') }}</span>
            </span>
            <span v-else>{{ i18n.t('data.no_data') }}</span>
          </template>
          <template #top>
            <div class="mb-1 mx-1">
              <v-text-field
                v-model="search"
                class="pt-0 my-2"
                hide-details
                prepend-inner-icon="mdi-magnify"
                @keyup.enter="createImage"
              />

              <div>
                <div class="float-left mr-2 filter__label text-body-2">{{ i18nLocal.t('tip.image_scope') }}</div>
                <v-chip-group v-model="filter.public" borderless color="primary">
                  <v-chip
                    v-for="(item, index) in [
                      { text: i18nLocal.t('tip.public'), value: true },
                      { text: i18nLocal.t('tip.self'), value: false },
                    ]"
                    :key="index"
                    label
                    small
                  >
                    <!-- <v-icon color="primary" small>{{ item.icon }}</v-icon> -->
                    {{ item.text }}
                  </v-chip>
                </v-chip-group>
                <div class="kubegems__clear-float" />
              </div>
              <div>
                <div class="float-left mr-2 filter__label text-body-2">{{ i18nLocal.t('tip.framework') }}</div>
                <v-chip-group v-model="filter.framework" borderless color="primary">
                  <v-chip
                    v-for="(item, index) in filterItemsMap.framework ? filterItemsMap.framework : []"
                    :key="index"
                    label
                    small
                  >
                    <!-- <v-icon color="primary" small>{{ item.icon }}</v-icon> -->
                    {{ item }}
                  </v-chip>
                </v-chip-group>
                <div class="kubegems__clear-float" />
              </div>
              <div>
                <div class="float-left mr-2 filter__label text-body-2">{{ i18nLocal.t('tip.python') }}</div>
                <v-chip-group v-model="filter.python" borderless color="primary">
                  <v-chip
                    v-for="(item, index) in filterItemsMap.python ? filterItemsMap.python : []"
                    :key="index"
                    label
                    small
                  >
                    {{ item }}
                  </v-chip>
                </v-chip-group>
                <div class="kubegems__clear-float" />
              </div>
            </div>
          </template>
          <template #item.createdAt="{ item }">
            {{ moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template #item.public="{ item }">
            <v-icon v-if="item.public" color="primary" small>mdi-check-circle</v-icon>
            <v-icon v-else color="error" small>mdi-minus-circle</v-icon>
          </template>
          <template #item.address="{ item }">
            {{ item.image || '-' }}
          </template>
          <template #item.python="{ item }">
            {{ item.labels ? item.labels.python || '-' : '-' }}
          </template>
          <template #item.os="{ item }">
            {{ item.labels ? item.labels.os || '-' : '-' }}
          </template>
          <template #item.framework="{ item }">
            <div class="float-left">
              <BaseLogo
                class="mr-2"
                :color="store.state.ThemeColor"
                default-logo="none"
                :icon-name="item.labels ? item.labels.framework || '-' : '-'"
                :ml="0"
                :mt="1"
                :width="20"
              />
            </div>
            <div class="float-left table__icon">
              {{ item.labels ? item.labels.framework || '-' : '-' }}
            </div>
            <div class="kubegems__clear-float" />
          </template>
          <template #item.description="{ item }">
            <v-menu
              v-if="item.description.length > 25"
              :close-delay="200"
              max-width="250"
              min-width="80"
              nudge-right="25px"
              nudge-top="-5px"
              open-on-hover
              top
            >
              <template #activator="{ on }">
                <div class="table__descritpion" v-on="on">
                  {{ item.description }}
                </div>
              </template>
              <v-card>
                <v-card-text class="pa-3 text-caption"> {{ item.description }} </v-card-text>
              </v-card>
            </v-menu>
            <div v-else class="table__descritpion">
              {{ item.description }}
            </div>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn class="mr-2 mb-2" color="error" dark right small text @click="close">
          {{ i18n.t('operate.close') }}
        </v-btn>
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="addImage">
          {{ i18n.t('operate.confirm') }}
        </v-btn>
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { randomString } from '@kubegems/libs/utils/helpers';
  import { stringifySelector } from '@kubegems/libs/utils/k8s_selector';
  import moment from 'moment';
  import { ComputedRef, computed, onMounted, reactive, ref } from 'vue';

  import { Image } from '../../api/image';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      value: string;
      edit?: boolean;
      for?: string;
    }>(),
    {
      value: '',
      edit: false,
      for: 'training',
    },
  );

  const state = reactive({
    menu: false,
    valid: false,
  });

  const emit = defineEmits(['input', 'change', 'overlay', 'outputImage']);
  const open = (): void => {
    const image = imageItems.value.find((i) => i.image === props.value);
    if (!image) {
      if (props.edit || props.value) {
        const createImage = new Image({
          image: props.value,
          public: false,
          name: `image-${randomString(4)}`,
          createdAt: new Date(),
          description: '',
        });
        createdImageItems.value.push(createImage);
        selected.value = [createImage];
      }
    } else {
      selected.value = [image];
    }
    state.menu = true;
    emit('overlay', true);
  };

  const addImage = (): void => {
    if (selected.value.length === 0) {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.select_one_image'),
        color: 'warning',
      });
      return;
    }
    emit('input', selected.value[0]?.image);
    emit('change', selected.value[0]?.image);
    emit('outputImage', selected.value[0]);
    close();
  };

  const createdImageItems = ref<Image[]>([]);
  const createImage = (): void => {
    if (imageItems.value?.length === 0) {
      if (!new RegExp('^[-\\._a-zA-Z0-9/]+:[-_a-zA-Z0-9\\.]+$').test(search.value.trim())) {
        store.commit('SET_SNACKBAR', {
          text: i18nLocal.t('tip.error_image_address'),
          color: 'warning',
        });
        return;
      }
      if (!createdImageItems.value.some((i) => i.image === search.value.trim()))
        createdImageItems.value.push(
          new Image({
            image: search.value.trim(),
            public: false,
            name: `image-${randomString(4)}`,
            createdAt: new Date(),
            description: '',
          }),
        );
    }
  };

  const close = (): void => {
    state.menu = false;
    selected.value = [];
    emit('overlay', false);
  };

  const selected = ref([]);
  const headers = [
    { text: i18nLocal.t('table.name'), value: 'name' },
    { text: i18nLocal.t('table.description'), value: 'description' },
    { text: i18nLocal.t('table.public'), value: 'public' },
    { text: i18nLocal.t('table.python'), value: 'python' },
    // { text: i18nLocal.t('table.os'), value: 'os' },
    { text: i18nLocal.t('table.framework'), value: 'framework' },
    { text: i18nLocal.t('table.address'), value: 'address', width: '400px' },
    // { text: i18nLocal.t('table.created_at'), value: 'createdAt' },
  ];

  const search = ref(void 0);
  const filter = reactive({
    public: void 0,
    framework: void 0,
    python: void 0,
  });
  const filterItemsMap: any = ref({});

  const getFilterItems = async (): Promise<void> => {
    const res = await Promise.all([
      new Image({
        tenant: store.getters.Tenant().TenantName,
      }).getImageSelectorList(),
      new Image().getPublicImageSelectorList(),
    ]);
    const list = res.reduce((pre, current) => pre.concat(current || []), []);
    list.forEach((l) => {
      filterItemsMap.value[l.name] = [].concat(l.values);
    });
  };
  const imageItems: ComputedRef<Image[]> = computed(() => {
    let items = selfImageItems.value.concat(publicImageItems.value).concat(createdImageItems.value);

    if (search.value) {
      items = items.filter((item) => item.image.indexOf(search.value) > -1);
    }

    if (filter.public !== undefined) {
      items = items.filter((item) => item.public === (filter.public === 0));
    }

    if (filter.framework !== undefined) {
      items = items.filter((item) => item?.labels?.framework === filterItemsMap.value?.framework[filter.framework]);
    }

    if (filter.python !== undefined) {
      items = items.filter((item) => item?.labels?.python === filterItemsMap.value?.python[filter.python]);
    }

    return items.sort((a, b) => {
      return Date.parse(b.createdAt.toString()) - Date.parse(a.createdAt.toString());
    });
  });

  const image: any = computed(() => {
    const selector = imageItems.value.find((item) => item.image === props.value);
    if (selector) return selector;
    return {};
  });

  const _itemHandler = (d: Image, open: boolean): Image => {
    const item = {
      ...d,
      id: `${open}-${d.name}`,
    };
    return new Image(item);
  };

  const labelSelector: string = stringifySelector({
    matchExpressions: [
      {
        key: 'for',
        operator: 'in',
        values: [props.for, 'generic', ''],
      },
    ],
  });

  const selfImageItems = ref<Image[]>([]);
  const getSelfImageItems = async (): Promise<void> => {
    const data = await new Image({
      tenant: store.getters.Tenant().TenantName,
    }).getImageList({
      'label-selector': labelSelector,
    });
    selfImageItems.value = data.map((d) => {
      return _itemHandler(d, false);
    });
  };

  const publicImageItems = ref<Image[]>([]);
  const getPublicImageItems = async (): Promise<void> => {
    const data = await new Image({
      tenant: store.getters.Tenant().TenantName,
    }).getPublicImageList();
    publicImageItems.value = data
      .map((d) => {
        return _itemHandler(d, true);
      })
      .filter((d) => {
        return d?.labels?.for === props.for;
      });
  };

  onMounted(() => {
    getSelfImageItems();
    getPublicImageItems();
    getFilterItems();
  });
</script>

<style lang="scss" scoped>
  .image {
    border: 2px solid var(--primary-color);

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 100px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: var(--primary-color);
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 6px;
      right: 3px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }
  }

  .v-list--three-line .v-list-item,
  .v-list-item--three-line {
    min-height: 48px;
  }

  .filter {
    &__label {
      line-height: 39px;
    }
  }
  .table {
    border: 2px solid var(--primary-color);

    &__descritpion {
      max-width: 200px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: pre;
    }

    &__icon {
      line-height: 28px;
    }
  }
</style>

<style>
  .filter__label__switch .v-label {
    height: 26px !important;
  }

  .image__table .v-data-table__wrapper {
    max-height: 300px;
  }
</style>
