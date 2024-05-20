<template>
  <v-flex :id="`table_${param.path.replaceAll('/', '_')}`">
    <BaseSubTitle
      v-if="pathLevel === 1"
      class="mb-4"
      :color="pathLevel === 1 ? 'xiaoshi__sub_title_bg' : ''"
      :divider="false"
      in-form
      schema
      :title="label"
    />

    <v-menu
      v-model="menu"
      bottom
      :close-on-content-click="false"
      nudge-top="18"
      offset-y
      origin="top center"
      right
      transition="scale-transition"
    >
      <template #activator="{ on }">
        <v-autocomplete
          :id="id"
          class="my-2"
          hide-no-data
          hide-selected
          :items="selectItems"
          :label="pathLevel === 1 ? '' : label"
          :menu-props="{
            bottom: true,
            left: true,
            origin: `top center`,
            nudgeBottom: '2px',
          }"
          :multiple="isMultiple"
          :no-data-text="i18n.t('data.no_data')"
          :rules="rules"
          :value="(isMultiple ? val : param.value) || param.default"
          v-on="on"
          @change="changed($event)"
        >
          <template #selection="{ item }">
            <template v-if="isMultiple"> ({{ item.text }}) </template>
            <template v-else>
              {{ item.text }}
            </template>
          </template>
        </v-autocomplete>
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
            :item-key="param['x-remote-enum'].table.key"
            :items="items"
            :items-per-page="10"
            :multiple="isMultiple"
            :no-data-text="i18n.t('data.no_data')"
            :no-results-text="i18n.t('data.no_data')"
            :search="search"
            show-select
            :single-select="!isMultiple"
          />
          <v-btn class="float-right" color="primary" small text @click.stop="confirm">
            <BaseIcon class="mr-2" height="20px" icon="tabler:square-rounded-check" width="20px" />
            {{ i18n.t('operate.confirm') }}
          </v-btn>
          <div class="xiaoshi__clear-float" />
        </v-card-text>
      </v-card>
    </v-menu>
  </v-flex>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
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

  const selectItems = computed(() => {
    return selected.value?.map((d) => {
      return {
        text: d[props.param['x-remote-enum']?.table?.key] || '',
        value: d[props.param['x-remote-enum']?.table?.key] || '',
      };
    });
  });

  const headers = computed(() => {
    const items = [];
    Object.keys(props.param['x-remote-enum']?.table?.headers || {}).map((key) => {
      if (key === props.param['x-remote-enum'].table.key) {
        items.splice(0, 0, { text: props.param['x-remote-enum']?.table?.headers[key], value: key, align: 'start' });
      } else {
        items.push({ text: props.param['x-remote-enum']?.table?.headers[key], value: key, align: 'start' });
      }
    });
    return items;
  });

  const getData = () => {
    fetch(
      props.param['x-remote-enum']?.url
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
        const [_datas] = JSONPath({ json: data, path: props.param['x-remote-enum']?.table?.['items_key'] || '' });
        _datas?.forEach((d) => {
          const item = {};
          Object.keys(props.param['x-remote-enum']?.table?.items || {}).map((k) => {
            [item[k]] = JSONPath({ json: d, path: props.param['x-remote-enum']?.table?.items[k] });
          });
          items.value.push(item);
        });
      });
  };

  const filterText = (value, search) => {
    return value != null && search != null && typeof value === 'string' && value.toString().indexOf(search) !== -1;
  };

  const menu = ref<boolean>(false);

  const isMultiple = computed(() => {
    if (props.param['x-remote-enum'].table.multiple) return true;
    return false;
  });

  const confirm = () => {
    if (props.param['x-remote-enum'].table.multiple) {
      const array = selected.value.map((d) => {
        return d[props.param['x-remote-enum']?.table?.key] || '';
      });
      changed(array);
    } else {
      const [item] = selected.value;
      changed(item[props.param['x-remote-enum']?.table?.key] || '');
    }
    menu.value = false;
  };

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const rules: ComputedRef<any> = computed(() => {
    return [required];
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
    getData();
  });

  const val = ref([]);
  watch(
    () => props.param.value,
    (newVal) => {
      if (isMultiple.value) {
        val.value = JSON.parse(newVal ? newVal.toString() : '[]');
        selected.value = val.value?.map((d) => {
          return { [props.param['x-remote-enum'].table.key]: d, [props.param['x-remote-enum'].table.key]: d };
        });
      } else {
        selected.value = [
          { [props.param['x-remote-enum'].table.key]: newVal, [props.param['x-remote-enum'].table.key]: newVal },
        ];
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>

<style>
  .param_table td {
    font-size: 0.875rem !important;
    font-weight: 400;
    line-height: 1.25rem;
    letter-spacing: 0.0178571429em !important;
    font-family: var(--root-font-family) !important;
  }
</style>
