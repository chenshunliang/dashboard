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
    <v-text-field
      :id="id"
      class="my-2"
      :hint="param.description || ''"
      :label="pathLevel === 1 ? '' : labelWithDesc"
      :placeholder="param.placeholder || ''"
      :rules="rules"
      :type="inputType ? inputType : 'text'"
      :value="inputType === 'text' ? param.value || param.default || '' : param.value || param.default"
      @change="changed($event)"
    >
      <template v-if="allowDelete" #append-outer>
        <v-btn color="error" icon small @click="removeItem">
          <v-icon color="error" size="20">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-text-field>
  </v-flex>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { positiveInteger, required, timeInterval } from '@kubegems/extension/ruler';
  import { ComputedRef, computed, onMounted } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
      inputType?: string;
      allowDelete?: boolean;
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
      inputType: '',
      allowDelete: false,
    },
  );

  const i18n = useGlobalI18n();

  const labelWithDesc = computed(() => {
    if (props.param.description) {
      return `${props.label}(${props.param.description})`;
    } else {
      return props.label;
    }
  });

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const rules: ComputedRef<any> = computed(() => {
    let _ruler = [];
    if (props.param.type?.indexOf('null') > -1 && !props.param.value) {
      _ruler = [];
    }
    if (props.param.minLength === 0) {
      _ruler = [];
    } else if (props.param.minLength > 0) {
      let rule = [(v) => v?.length >= props.param.minLength || i18n.t('ruler.lt_min', [props.param.minLength])];
      if (props.param.maxLength) {
        rule = rule.concat([
          (v) => v?.length <= props.param.maxLength || i18n.t('ruler.gt_max', [props.param.maxLength]),
        ]);
      }
      _ruler = _ruler.concat(rule);
    }
    if (props.param.minimum && props.param.maximum) {
      _ruler = _ruler.concat([
        (v) => parseFloat(v || 0) >= props.param.minimum || i18n.t('ruler.lt_num_min', [props.param.minimum]),
        (v) => parseFloat(v || 0) <= props.param.maximum || i18n.t('ruler.gt_num_max', [props.param.maximum]),
      ]);
    }
    if (props.param.type === 'integer') {
      _ruler = _ruler.concat([positiveInteger]);
    }
    if (props.param.pattern) {
      _ruler = _ruler.concat([
        (v) => !v || !!new RegExp(props.param.pattern).test(v) || i18n.t('ruler.regexp', [props.param.pattern]),
      ]);
    }
    if (props.param.format === 'duration') {
      _ruler = _ruler.concat([timeInterval]);
    } else if (props.param.format === 'date-time') {
      _ruler = _ruler.concat([
        (v) => !v || !!new RegExp('(^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$)').test(v) || i18n.t('ruler.datetime'),
      ]);
    } else if (props.param.format === 'time') {
      _ruler = _ruler.concat([(v) => !v || !!new RegExp('(^\\d{2}:\\d{2}:\\d{2}$)').test(v) || i18n.t('ruler.time')]);
    } else if (props.param.format === 'date') {
      _ruler = _ruler.concat([(v) => !v || !!new RegExp('(^\\d{4}-\\d{2}-\\d{2}$)').test(v) || i18n.t('ruler.date')]);
    }
    return _ruler.concat([]);
  });

  const emit = defineEmits(['changeBasicFormParam', 'removeItem']);
  const changed = (value: number | string): void => {
    if (props.inputType === 'number' && value) {
      value = parseFloat(value.toString());
    }
    if (value || value === 0) {
      emit('changeBasicFormParam', props.param, value);
    } else {
      emit('changeBasicFormParam', props.param, null);
    }
  };

  const removeItem = () => {
    emit('removeItem', props.param.path);
  };

  onMounted(() => {
    changed(props.param.value || props.param.default);
  });
</script>
