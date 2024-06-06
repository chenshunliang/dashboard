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
      :rules="rules"
      type="number"
      :value="v"
      @change="sliderChanged($event)"
    >
      <template #append>
        <span class="text-body-2 kubegems__text">
          {{ param.sliderUnit }}
        </span>
      </template>
    </v-text-field>
    <v-flex />
  </v-flex>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { ComputedRef, computed, onMounted, ref } from 'vue';

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

  const v = ref<number>(0);
  const rules = [
    required,
    (v) => v >= props.param.sliderMin || i18n.t('ruler.lt_min_value'),
    (v) => v <= props.param.sliderMax || i18n.t('ruler.gt_max_value'),
  ];

  const emit = defineEmits(['changeBasicFormParam']);
  const changed = (event: string): void => {
    emit('changeBasicFormParam', props.param, event);
  };
  const sliderChanged = (val: number): void => {
    const value = val + props.param.sliderUnit;
    changed(value);
  };

  onMounted(() => {
    v.value = parseInt(props.param.value.match(/\d/g).join(''));
    sliderChanged(v.value);
  });
</script>
