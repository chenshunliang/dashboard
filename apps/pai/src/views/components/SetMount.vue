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
    nudge-top="400"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="on">
      <v-row class="mt-0">
        <v-col v-for="(cate, i) in Object.keys(icon)" :key="i" class="pt-0" cols="3">
          <div class="mb-1 text-center">{{ i18nLocal.t(`tip.${cate}`) }}</div>
          <template v-for="(item, index) in obj.filter((o) => o.kind === cate) || []">
            <v-col v-if="item.name" :key="index" class="pt-0 px-0">
              <v-hover #default="{ hover }">
                <v-card class="volume volume__pos" :elevation="hover ? 2 : 0" flat v-on="on">
                  <template v-if="item.source !== store.getters.Tenant().TenantName">
                    <v-flex
                      v-for="(it, key) in [
                        { t: 30, r: 20 },
                        { t: 30, r: 55 },
                        { t: 30, r: 90 },
                        { t: 30, r: 125 },
                        { t: 30, r: 160 },
                        { t: 30, r: 195 },
                        { t: 30, r: 230 },
                        { t: 30, r: 265 },
                      ]"
                      :key="key"
                      class="watermark"
                      :style="{ top: `${it.t}px`, right: `${it.r}px` }"
                    >
                      {{ i18nLocal.t(`tip.public_${item.kind}`) }}
                    </v-flex>
                  </template>
                  <v-list-item three-line>
                    <v-list-item-content>
                      <v-list-item-title class="text-body-2 move">
                        <v-menu
                          v-if="item.name.length > 19"
                          :close-delay="200"
                          max-width="300"
                          min-width="80"
                          nudge-right="25px"
                          nudge-top="-5px"
                          open-on-hover
                          top
                        >
                          <template #activator="{ on }">
                            <div v-on="on">
                              <div class="float-left">
                                <BaseLogo
                                  v-if="item.source !== store.getters.Tenant().TenantName"
                                  class="mr-2"
                                  :color="store.state.ThemeColor"
                                  default-logo="kubegems"
                                  :icon-name="item.source"
                                  :ml="0"
                                  :mt="1"
                                  :width="20"
                                />
                                <v-icon v-else color="primary" left>{{ icon[item.kind] }}</v-icon>
                              </div>
                              <div class="float-left watermark__name"> {{ item.name }} </div>
                              <div class="kubegems__clear-float" />
                            </div>
                          </template>
                          <v-card>
                            <v-card-text class="pa-3 text-caption"> {{ item.name }} </v-card-text>
                          </v-card>
                        </v-menu>
                        <div v-else class="watermark__name">
                          <div class="float-left">
                            <BaseLogo
                              v-if="item.source !== store.getters.Tenant().TenantName"
                              class="mr-2"
                              :color="store.state.ThemeColor"
                              default-logo="kubegems"
                              :icon-name="item.source"
                              :ml="0"
                              :mt="1"
                              :width="20"
                            />
                            <v-icon v-else color="primary" left>{{ icon[item.kind] }}</v-icon>
                          </div>
                          <div class="float-left watermark__name"> {{ item.name }} </div>
                          <div class="kubegems__clear-float" />
                        </div>
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <span class="text-body-2"> {{ item.targetPath }} </span>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-flex class="volume__watermark-bg" />
                  <v-flex class="volume__watermark font-weight-medium">
                    {{ i18nLocal.t(`tip.${item.kind}`) }}
                  </v-flex>
                </v-card>
              </v-hover>
            </v-col>
          </template>
        </v-col>
      </v-row>
      <v-flex class="grey lighten-4 rounded mt-3">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-2 py-0 text-center">
              <v-btn color="primary" text @click="open">
                <v-icon left small> mdi-swap-horizontal </v-icon>
                {{ i18nLocal.t('operate.mount_c', [i18nLocal.t('tip.volume')]) }}
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </template>
    <v-card>
      <v-card-text class="pa-2 py-3">
        <BaseSubTitle :title="i18nLocal.t('tip.data_conf')" />
        <v-data-table
          v-model="selected"
          class="mx-2 mt-2 pa-2 rounded table mount__table"
          dense
          disable-sort
          :footer-props="{
            'items-per-page-options': [10, 20],
            'items-per-page-text': i18nLocal.t('tip.per_page'),
          }"
          :headers="headers"
          item-key="id"
          item-selected="id"
          :items="setItems"
          :items-per-page="10"
          :no-data-text="i18n.t('data.no_data')"
          :no-results-text="i18n.t('data.no_data')"
          show-select
        >
          <template #top>
            <div class="mb-1 mx-1">
              <v-text-field v-model="search" class="pt-0 my-2" hide-details prepend-inner-icon="mdi-magnify">
                <template #append>
                  <v-switch
                    v-model="state.viewPublicData"
                    class="filter__label__switch"
                    hide-details
                    @change="kind = 0"
                  >
                    <template #label>
                      <div class="text-body-2 mt-n3">{{ i18nLocal.t('tip.view_public_data') }}</div>
                    </template>
                  </v-switch>
                </template>
              </v-text-field>

              <div class="mt-2">
                <span class="mr-2">{{ i18nLocal.t('tip.mount_count') }}</span>
                <span :class="{ 'error--text': selected.length > total }"> {{ selected.length }} / {{ total }} </span>
              </div>

              <div class="float-left mr-2 filter__label text-body-2">{{ i18nLocal.t('tip.kind') }}</div>
              <v-chip-group v-model="kind" borderless color="primary" mandatory>
                <v-chip v-for="(item, index) in kindItems" :key="index" label small>
                  <!-- <v-icon color="primary" small>{{ item.icon }}</v-icon> -->
                  {{ item.text }}
                </v-chip>
              </v-chip-group>

              <template v-if="state.viewPublicData">
                <div class="float-left mr-2 filter__label text-body-2">{{ i18nLocal.t('tip.set_source') }}</div>
                <v-chip-group v-model="source" borderless color="primary">
                  <v-chip v-for="(item, index) in sourceItems" :key="index" label small>
                    <!-- <v-icon color="primary" small>{{ item.icon }}</v-icon> -->
                    {{ item.text }}
                  </v-chip>
                </v-chip-group>
              </template>

              <div class="float-left mr-2 filter__label text-body-2">{{ i18nLocal.t('tip.data') }}</div>
              <v-chip-group v-model="select" borderless color="primary" mandatory>
                <v-chip v-for="(item, index) in selectItems" :key="index" label small>
                  <!-- <v-icon color="primary" small>{{ item.icon }}</v-icon> -->
                  {{ item.text }}
                </v-chip>
              </v-chip-group>
            </div>
          </template>
          <template #item.createdAt="{ item }">
            {{ moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template #item.description="{ item }">
            <v-menu
              v-if="item.description.length > 20"
              :close-delay="200"
              max-width="300"
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
          <template #item.source="{ item }">
            <div class="float-left">
              <BaseLogo
                class="mr-2"
                :color="store.state.ThemeColor"
                default-logo="kubegems"
                :icon-name="item.tenant"
                :ml="0"
                :mt="1"
                :width="20"
              />
            </div>
            <div class="float-left table__icon">{{ item.tenant }}</div>
            <div class="kubegems__clear-float" />
          </template>
          <template #item.name="{ item }">
            <v-menu
              v-if="item.name.length > 20"
              :close-delay="200"
              max-width="300"
              min-width="80"
              nudge-right="25px"
              nudge-top="-5px"
              open-on-hover
              top
            >
              <template #activator="{ on }">
                <div class="table__name" v-on="on">
                  <div>{{ item.displayName }}</div>
                  <div class="text-caption">{{ item.name }}</div>
                </div>
              </template>
              <v-card>
                <v-card-text class="pa-3 text-caption"> {{ item.name }} </v-card-text>
              </v-card>
            </v-menu>
            <div v-else class="table__name">
              <div>{{ item.displayName }}</div>
              <div class="text-caption">{{ item.name }}</div>
            </div>
          </template>
          <template #item.targetPath="{ item }">
            <template v-if="!item.edit">
              {{ item.targetPath || '--' }}
              <v-btn color="orange" icon small @click="updateTargetMount(item)">
                <v-icon small> mdi-pencil </v-icon>
              </v-btn>
            </template>
            <v-form v-else class="pb-1" @submit.prevent>
              <v-text-field
                v-model.trim="item._targetPath"
                dense
                hide-details
                :placeholder="i18nLocal.t('tip.mount')"
                required
                @keyup.enter="addTargetMount(item)"
              >
                <template #append>
                  <v-btn color="success" icon small @click.stop="addTargetMount(item)">
                    <v-icon small> mdi-check </v-icon>
                  </v-btn>
                  <v-btn color="error" icon small @click.stop="closeTargetMount(item)">
                    <v-icon small> mdi-close </v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-form>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn class="mr-2 mb-2" color="error" dark right small text @click="close">
          {{ i18n.t('operate.close') }}
        </v-btn>
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="mountSet">
          {{ i18n.t('operate.confirm') }}
        </v-btn>
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { convertResponse2Pagination } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { PAI_SET_MOUNT_PATH_KEY } from '@kubegems/libs/constants/label';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import _ from 'lodash';
  import moment from 'moment';
  import { ComputedRef, computed, onMounted, reactive, ref, watch } from 'vue';

  import { SetBase } from '../../api/base';
  import { Codeset } from '../../api/codeset';
  import { Dataset } from '../../api/dataset';
  import { MountSet } from '../../api/job';
  import { Modelset } from '../../api/modelset';
  import { Workspace } from '../../api/workspace';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      value: MountSet[];
    }>(),
    {
      value: void 0,
    },
  );

  const state = reactive({
    menu: false,
    valid: false,
    viewPublicData: false,
  });

  const icon = {
    modelset: 'mdi-package-variant',
    dataset: 'mdi-database',
    codeset: 'mdi-code-json',
    workspace: 'mdi-home',
  };

  const emit = defineEmits(['input', 'change', 'overlay']);
  const open = (): void => {
    state.menu = true;
    setItemsCopyed.value.forEach((item) => {
      const _selected = props.value.find(
        (s) => `${s.kind}-${s.source || s.tenant}-${s.name}` === `${item.type}-${item.tenant}-${item.name}`,
      );
      if (_selected) {
        if (
          !selected.value.some((s) => {
            return s.id === item.id;
          })
        )
          selected.value.push(item);
      }
    });
    selected.value = selected.value
      .filter(function (item, index, arr) {
        return arr.findIndex((_item) => _item.id === item.id) === index;
      })
      .slice();
    emit('overlay', true);
  };

  const mountSet = (): void => {
    if (selected.value.length > total) {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.mount_count_exceed'),
        color: 'warning',
      });
      return;
    }
    const noPassedItems = selected.value.filter((item) => {
      return !Boolean(item.targetPath);
    });
    if (noPassedItems?.length > 0) {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.mount_path_nil'),
        color: 'warning',
      });
      return;
    }
    const _pathArray = selected.value.map((item) => {
      return item.targetPath;
    });
    if (new Set(_pathArray).size !== selected.value.length) {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.mount_path_repeat'),
        color: 'warning',
      });
      return;
    }

    constructObj();

    emit('input', obj.value);
    emit('change', obj.value);
    close();
  };

  const constructObj = (): void => {
    obj.value = selected.value.map((item) => {
      return {
        name: item.name,
        kind: item.type,
        source: item.tenant || '',
        targetPath: item.targetPath,
      };
    });
  };

  const close = (): void => {
    state.menu = false;
    selected.value = [];
    kind.value = 0;
    state.viewPublicData = false;
    emit('overlay', false);
  };

  const kind = ref(0);
  const kindItems = computed(() => {
    if (state.viewPublicData) {
      return [
        { text: i18nLocal.t('tip.public_dataset'), value: 'dataset' },
        { text: i18nLocal.t('tip.public_modelset'), value: 'modelset' },
      ];
    } else {
      return [
        { text: i18nLocal.t('tip.dataset'), value: 'dataset' },
        { text: i18nLocal.t('tip.modelset'), value: 'modelset' },
        { text: i18nLocal.t('tip.codeset'), value: 'codeset' },
        { text: i18nLocal.t('tip.workspaceset'), value: 'workspace' },
      ];
    }
  });

  const source = ref(void 0);
  const sourceItems = computed(() => {
    return [
      { text: i18nLocal.t('tip.platform'), value: 'platform' },
      { text: 'Model X', value: 'modelx' },
      { text: 'Hugging Face', value: 'huggingface' },
    ];
  });

  const select = ref(false);
  const selectItems = [
    { text: i18nLocal.t('tip.all'), value: false },
    { text: i18nLocal.t('tip.select'), value: true },
  ];

  const selected = ref([]);
  const headers = computed(() => {
    const items = [
      { text: i18nLocal.t('table.name'), value: 'name', cellClass: 'set_mount' },
      { text: i18nLocal.t('table.description'), value: 'description' },
      { text: i18nLocal.t('table.created_at'), value: 'createdAt' },
      { text: i18nLocal.t('table.target_mount'), value: 'targetPath', width: 400 },
    ];
    if (state.viewPublicData) {
      items.splice(2, 0, { text: i18nLocal.t('table.source'), value: 'source' });
    }
    return items;
  });
  const obj = ref<MountSet[]>([]);

  const addTargetMount = (item: SetBase): void => {
    if (!new RegExp('^/').test(item._targetPath)) {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.mount_path'),
        color: 'warning',
      });
      return;
    }
    item.targetPath = item._targetPath;
    const _item = selected.value.find(
      (s) => `${item.kind}-${item.tenant}-${item.name}` === `${s.kind}-${s.source || s.tenant}-${s.name}`,
    );
    if (_item) {
      _item.targetPath = item._targetPath;
    }
    item.edit = false;
  };
  const closeTargetMount = (item: SetBase): void => {
    item._targetPath = '';
    item.edit = false;
  };
  const updateTargetMount = (item: SetBase): void => {
    item._targetPath = item.targetPath;
    item.edit = true;
  };

  const search = ref(void 0);
  const setItemsCopyed: ComputedRef<SetBase[]> = computed(() => {
    let items = _.uniqWith(
      datasetItems.value
        .concat(modelsetItems.value)
        .concat(codesetItems.value)
        .concat(workspaceSetItems.value)
        .concat(publicDatasetItems.value)
        .concat(publicModelsetItems.value),
      (a, b) => {
        return a.name === b.name && a.tenant === b.tenant && a.type === b.type;
      },
    );
    return items;
  });
  const setItems: ComputedRef<SetBase[]> = computed(() => {
    let items = _.uniqWith(
      datasetItems.value
        .concat(modelsetItems.value)
        .concat(codesetItems.value)
        .concat(workspaceSetItems.value)
        .concat(publicDatasetItems.value)
        .concat(publicModelsetItems.value),
      (a, b) => {
        return a.name === b.name && a.tenant === b.tenant && a.type === b.type;
      },
    );

    if (kind.value > -1) {
      items = items.filter((item) => item.type === kindItems.value[kind.value].value);
    }
    if (source.value > -1 && state.viewPublicData) {
      items = items.filter((item) => {
        if (sourceItems.value[source.value].value === 'platform') {
          return item.tenant !== 'modelx' && item.tenant !== 'huggingface';
        } else {
          return item.tenant === sourceItems.value[source.value].value;
        }
      });
    }
    if (select.value) {
      items = items.filter((item) => selected.value.some((s) => s.id === item.id));
    }
    if (search.value) {
      items = items.filter((item) => item.name.indexOf(search.value) > -1);
    }

    if (state.viewPublicData) {
      items = items.filter((item) => item.public === true && item.tenant !== store.getters.Tenant().TenantName);
    } else {
      items = items.filter((item) => item.tenant === store.getters.Tenant().TenantName);
    }

    return items.sort((a, b) => {
      return Date.parse(b.createdAt.toString()) - Date.parse(a.createdAt.toString());
    });
  });

  const defaultPathMap = {
    dataset: '/datas/datasets',
    modelset: '/datas/models',
    codeset: '/datas/code',
    workspace: '/datas/workspaces',
  };

  const _itemHandler = (d: SetBase, type: string): SetBase => {
    const _selected = props.value.find(
      (s) => `${s.kind}-${s.source || s.tenant}-${s.name}` === `${type}-${d.tenant}-${d.name}`,
    );
    const item = {
      ...d,
      type: type,
      targetPath: _selected?.targetPath || d.annotations[PAI_SET_MOUNT_PATH_KEY] || defaultPathMap[type] || '',
      _targetPath: '',
      edit: false,
      id: `${type}-${d.tenant}-${d.name}`,
      tenant: d.tenant,
    };
    if (_selected) selected.value.push(item);
    return new SetBase(item);
  };

  const datasetItems = ref<SetBase[]>([]);
  const getDataSetItems = async (): Promise<void> => {
    const data = await new Dataset({
      tenant: store.getters.Tenant().TenantName,
      region: store.getters.Region().RegionName,
    }).getDatasetList({ page: 1, size: 1000 });
    datasetItems.value = convertResponse2Pagination(data).items.map((d) => {
      return _itemHandler(d, 'dataset');
    });
  };

  const modelsetItems = ref<SetBase[]>([]);
  const getModelSetItems = async (): Promise<void> => {
    const data = await new Modelset({
      tenant: store.getters.Tenant().TenantName,
      region: store.getters.Region().RegionName,
    }).getModelsetList({ page: 1, size: 1000 });
    modelsetItems.value = convertResponse2Pagination(data).items.map((d) => {
      return _itemHandler(d, 'modelset');
    });
  };

  const codesetItems = ref<SetBase[]>([]);
  const getCodeSetItems = async (): Promise<void> => {
    const data = await new Codeset({
      tenant: store.getters.Tenant().TenantName,
      region: store.getters.Region().RegionName,
    }).getCodesetList({ page: 1, size: 1000 });
    codesetItems.value = convertResponse2Pagination(data).items.map((d) => {
      return _itemHandler(d, 'codeset');
    });
  };

  const workspaceSetItems = ref<SetBase[]>([]);
  const getWorkspaceSetItemsItems = async (): Promise<void> => {
    const data = await new Workspace({
      tenant: store.getters.Tenant().TenantName,
      region: store.getters.Region().RegionName,
    }).getWorkspaceList({ page: 1, size: 1000 });
    workspaceSetItems.value = convertResponse2Pagination(data).items.map((d) => {
      return _itemHandler(d, 'workspace');
    });
  };

  const publicDatasetItems = ref<SetBase[]>([]);
  const getPublicDataSetItems = async (): Promise<void> => {
    const data = await new Dataset({
      region: store.getters.Region().RegionName,
    }).getPublicDatasetList({ page: 1, size: 1000 });
    publicDatasetItems.value = convertResponse2Pagination(data).items.map((d) => {
      return _itemHandler(d, 'dataset');
    });
  };

  const publicModelsetItems = ref<SetBase[]>([]);
  const getPublicModelSetItems = async (): Promise<void> => {
    const data = await new Modelset({
      region: store.getters.Region().RegionName,
    }).getPublicModelsetList({ page: 1, size: 1000 });
    publicModelsetItems.value = convertResponse2Pagination(data).items.map((d) => {
      return _itemHandler(d, 'modelset');
    });
  };

  onMounted(() => {
    getDataSetItems();
    getModelSetItems();
    getCodeSetItems();
    getWorkspaceSetItemsItems();
    getPublicDataSetItems();
    getPublicModelSetItems();
  });

  watch(
    () => props.value,
    (newValue) => {
      if (newValue) {
        obj.value = deepCopy(newValue);
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const total = 8;
</script>

<style lang="scss" scoped>
  .volume {
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
      top: 9px;
      right: 0;
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

    &__name {
      max-width: 200px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: pre;
    }

    &__icon {
      line-height: 28px;
    }
  }

  .watermark {
    position: absolute;
    color: grey;
    opacity: 0.5;
    font-size: 0.7rem;
    rotate: -35deg;
    font-weight: 300;
    text-shadow: 0 0 2px #444444;

    &__name {
      max-width: 190px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: pre;
      line-height: 28px;
    }
  }
</style>

<style>
  .set_mount {
    height: 36.5px !important;
  }

  .filter__label__switch .v-label {
    height: 26px !important;
  }

  .mount__table .v-data-table__wrapper {
    max-height: 350px;
  }

  .mount__table .v-data-table__selected {
    font-weight: 500;
  }
</style>
