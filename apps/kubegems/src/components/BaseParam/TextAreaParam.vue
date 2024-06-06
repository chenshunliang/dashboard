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
    <v-textarea
      :id="id"
      auto-grow
      class="my-2"
      :hint="param.description || ''"
      :label="pathLevel === 1 ? '' : labelWithDesc"
      :placeholder="param.placeholder || ''"
      :rules="rules"
      :value="param.value || param.default || ''"
      @change="changed($event)"
    />
  </v-flex>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { ComputedRef, computed, onMounted } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
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
    if (props.param.pattern) {
      _ruler = _ruler.concat([
        (v) => !v || !!new RegExp(props.param.pattern).test(v) || i18n.t('ruler.regexp', [props.param.pattern]),
      ]);
    }
    return _ruler.concat([]);
  });

  const emit = defineEmits(['changeBasicFormParam']);
  const changed = (event: string): void => {
    emit('changeBasicFormParam', props.param, event);
  };

  onMounted(() => {
    changed(props.param.value || props.param.default);
  });
</script>
