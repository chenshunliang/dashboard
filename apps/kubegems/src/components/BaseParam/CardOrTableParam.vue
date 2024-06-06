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
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'kubegems__sub_title_bg' : ''"
      :divider="false"
      in-form
      schema
      :title="label"
    />
    <div v-if="param['x-remote-enum'].tab || param.cols >= 6" class="text-body-1 mb-2">{{ param.title }}</div>
    <template v-if="param['x-remote-enum'].tab">
      <div class="d-flex">
        <v-card
          v-for="(item, index) in param['x-remote-enum'].tab.items || []"
          :key="index"
          :class="`mr-3 pa-2 kubegems__pointer`"
          max-width="200px"
          min-width="150px"
          outlined
          :style="{ border: category === item.title ? `2px solid ${store.state.ThemeColor}` : '' }"
          @click.stop="setCategory(item.title)"
        >
          <div class="d-flex justify-center">
            <img :src="getModelImage(item.title.toLocaleLowerCase())" width="50px" />
          </div>
          <div class="text--primary text-body-1 text-center"> {{ item.title }}</div>
        </v-card>
      </div>
      <div class="text-body-2 text--secondary mt-2 ml-2">{{ cateM ? cateM.description : '' }}</div>

      <div class="text-body-1 mb-2 mt-3">{{ param['x-remote-enum'].tab.title || '' }}</div>
    </template>

    <v-menu
      v-if="category.toLocaleLowerCase() === 'custom' || !param['x-remote-enum'].tab"
      v-model="menu"
      bottom
      :close-on-content-click="false"
      max-width="900"
      nudge-top="18"
      offset-y
      origin="top center"
      right
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <v-row>
          <v-col :cols="param['x-remote-enum'].tab ? 6 : param.cols || 12">
            <v-autocomplete
              :id="id"
              class="my-2"
              hide-no-data
              hide-selected
              :items="selectItems"
              :label="pathLevel === 1 ? '' : labelWithDesc"
              :menu-props="{
                bottom: true,
                left: true,
                origin: `top center`,
                nudgeBottom: '2px',
              }"
              :no-data-text="i18n.t('data.no_data')"
              :rules="rules"
              :value="(isMultiple ? val : param.value) || param.default"
              v-on="on"
              @change="changed($event)"
              @focus="getData"
            >
              <template #selection="{ item }">
                <div class="d-flex">
                  {{ item['text'] }}
                  <div class="text-body-2 ml-2 text--secondary">{{ item['extand'] || '' }}</div>
                </div>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
      </template>
      <v-card>
        <v-card-text class="pa-2 pb-4">
          <div class="text-body-1 text--primary px-4 pt-4">{{ param.title }}</div>
          <div v-if="param.description" class="text-body-2 text--secondary px-4">{{ param.description }}</div>
          <v-text-field v-model="search" class="mx-4" :label="i18n.t('query')" />
          <v-data-table
            v-model="selected"
            class="px-4 rounded table param_table"
            :custom-filter="filterText"
            dense
            :footer-props="{
              'items-per-page-options': [10, 20],
              'items-per-page-text': i18n.t('tip.per_page'),
            }"
            :headers="headers"
            :item-key="key"
            :items="items"
            :items-per-page="10"
            :multiple="isMultiple"
            :no-data-text="i18n.t('data.no_data')"
            :no-results-text="i18n.t('data.no_data')"
            :search="search"
            show-select
            :single-select="!isMultiple"
          >
            <template #item.$.public="{ item }">
              <v-icon v-if="item['$.public']" size="20px" :style="{ marginTop: '6px' }">mdi-check</v-icon>
              <v-icon v-else color="error" size="20px" :style="{ marginTop: '6px' }">mdi-close</v-icon>
            </template>
            <template #item.$.onSale="{ item }">
              <v-icon v-if="item['$.onSale']" size="20px" :style="{ marginTop: '6px' }">mdi-check</v-icon>
              <v-icon v-else color="error" size="20px" :style="{ marginTop: '6px' }">mdi-close</v-icon>
            </template>
          </v-data-table>
          <v-btn class="float-right" color="primary" small text @click.stop="confirm">
            {{ i18n.t('operate.confirm') }}
          </v-btn>
          <div class="kubegems__clear-float" />
        </v-card-text>
      </v-card>
    </v-menu>

    <template v-else>
      <div class="d-flex">
        <v-card
          v-for="(item, index) in items || []"
          :key="index"
          :class="`pa-3 text-body-1 mr-3 kubegems__pointer`"
          max-width="300"
          outlined
          :style="{ border: sub === item[key] ? `2px solid ${store.state.ThemeColor}` : '' }"
          @click.stop="setSub(item[key])"
        >
          <div class="d-flex justify-center">
            {{ item[key] }}
          </div>
        </v-card>
        <div v-if="items.length === 0" class="text-body-1 text--secondary">
          {{ i18n.t('data.no_data') }}
        </div>
      </div>
      <div class="text-body-2 text--secondary mt-2 ml-2">{{ subM ? subM['$.description'] : '' }}</div>
    </template>
  </v-flex>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { getModelImage } from '@kubegems/extension/icon/helpers';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { JSONPath } from 'jsonpath-plus';
  import { ComputedRef, computed, onMounted, ref, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
      inputType?: string;
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
      inputType: '',
    },
  );

  const i18n = useGlobalI18n();
  const store = useStore();

  const items = ref([]);

  const selected = ref();
  const search = ref('');

  const labelWithDesc = computed(() => {
    if (props.param.description) {
      return `${props.label}(${props.param.description})`;
    } else {
      return props.label;
    }
  });

  const key = computed(() => {
    return props.param['x-remote-enum'].tab
      ? props.param['x-remote-enum']?.tab?.items?.find((i) => {
          return i.title === category.value;
        })?.['x-remote-enum']?.table?.key
      : props.param['x-remote-enum']?.table?.key;
  });

  const selectItems = computed(() => {
    return selected.value?.map((d) => {
      return {
        text: d[key.value] || '',
        value: d[key.value] || '',
        extand: d[props.param['x-remote-enum']?.table?.extend] || '',
      };
    });
  });

  const headers = computed(() => {
    const columns = props.param['x-remote-enum'].tab
      ? props.param['x-remote-enum']?.tab?.items?.find((i) => {
          return i.title === category.value;
        })?.['x-remote-enum']?.table?.columns
      : props.param['x-remote-enum']?.table?.columns;

    const items = [];
    (columns || []).forEach((item) => {
      if (item.jsonPath === key.value) {
        items.splice(0, 0, { text: item.title, value: item.jsonPath, align: 'start', type: item.type || 'string' });
      } else {
        items.push({ text: item.title, value: item.jsonPath, align: 'start', type: item.type || 'string' });
      }
    });
    return items;
  });

  const getData = () => {
    const url = props.param['x-remote-enum'].tab
      ? props.param['x-remote-enum']?.tab?.items?.find((i) => {
          return i.title === category.value;
        })?.['x-remote-enum']?.table?.http?.url
      : props.param['x-remote-enum']?.table?.http?.url;
    fetch(
      url
        ?.replace('{.tenant}', store.getters.Tenant().TenantName)
        ?.replace('{.region}', store.getters.Region().RegionName),
      {
        headers: {
          Authorization: 'Bearer ' + store.state.JWT,
        },
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        items.value = [];
        const jpath = props.param['x-remote-enum'].tab
          ? props.param['x-remote-enum']?.tab?.items?.find((i) => {
              return i.title === category.value;
            })?.['x-remote-enum']?.table?.http?.jsonPath
          : props.param['x-remote-enum']?.table?.http?.jsonPath;
        const [_datas] = JSONPath({ json: data, path: jpath || '' });
        _datas?.forEach((d) => {
          const item = {};
          const columns = props.param['x-remote-enum'].tab
            ? props.param['x-remote-enum']?.tab?.items?.find((i) => {
                return i.title === category.value;
              })?.['x-remote-enum']?.table?.columns
            : props.param['x-remote-enum']?.table?.columns;
          (columns || []).forEach((_it) => {
            [item[_it.jsonPath]] = JSONPath({ json: d, path: _it.jsonPath });
          });

          [item[key.value]] = JSONPath({
            json: d,
            path: key.value,
          });
          items.value.push(item);
        });
      });
  };

  const category = ref('');
  const setCategory = (_category: string) => {
    category.value = _category;
    getData();
  };
  const cateM = computed(() => {
    return props.param?.['x-remote-enum']?.tab?.items?.find((i) => {
      return i.title === category.value;
    });
  });

  const filterText = (value, search) => {
    return value != null && search != null && typeof value === 'string' && value.toString().indexOf(search) !== -1;
  };

  const menu = ref<boolean>(false);

  const confirm = () => {
    const [item] = selected.value || [];
    if (item) {
      changed(item[key.value] || '');

      menu.value = false;
    }
  };

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const rules: ComputedRef<any> = computed(() => {
    return [];
  });

  const sub = ref('');
  const setSub = (_sub: string) => {
    sub.value = _sub;
    changed(sub.value || '');
  };
  const subM = computed(() => {
    const _subM = items.value.find((i) => {
      return i[key.value] === sub.value;
    });
    return _subM;
  });

  const emit = defineEmits(['changeBasicFormParam']);
  const changed = (value: number | string): void => {
    if (props.inputType === 'number' && value) {
      value = parseFloat(value.toString());
    }
    if (value) {
      emit('changeBasicFormParam', props.param, value);
    } else {
      emit('changeBasicFormParam', props.param, null);
    }
  };
  onMounted(() => {
    changed(props.param.value);
    if (!props.param['x-remote-enum'].tab) {
      getData();
    }
  });

  const isMultiple = computed(() => {
    if (props.param['x-remote-enum'].table?.multiple) return true;
    return false;
  });

  const val = ref([]);
  watch(
    () => props.param.value,
    async (newVal) => {
      if (!newVal || sub.value === newVal) return;
      const _enum = props.param?.['x-remote-enum']?.tab?.items?.find((i) => {
        const urlParams = new URLSearchParams(i['x-remote-enum']?.table?.http?.url?.toLocaleLowerCase() || '');
        return newVal?.toLocaleLowerCase()?.indexOf(urlParams.get('search')) > -1;
      });
      if (_enum) {
        category.value = _enum.title;
        await getData();
        sub.value = newVal;
      } else {
        if (newVal) {
          category.value = 'custom';
          if (isMultiple.value) {
            val.value = JSON.parse(newVal ? newVal.toString() : '[]');
            selected.value = val.value?.map((d) => {
              return { [key.value]: d };
            });
          } else {
            selected.value = [{ [key.value]: newVal }];
          }
        }
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>
