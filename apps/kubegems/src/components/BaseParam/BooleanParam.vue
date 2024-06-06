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
    <v-switch
      :id="id"
      class="ma-2 float-left"
      color="primary"
      hide-details
      :input-value="param.value === true ? true : false"
      inset
      :label="pathLevel === 1 ? '' : label"
      @change="changed($event)"
      @click="click"
    />
    <div class="kubegems__clear-float" />
    <div v-if="param.description" class="text-body-2 text--secondary">
      {{ param.description || '' }}
    </div>
  </v-flex>
</template>

<script lang="ts" setup>
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

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const v = ref<boolean>(false);
  const emit = defineEmits(['changeBasicFormParam']);
  const click = (): void => {
    // 先监听change事件,设置布尔值状态值, 同时监听到点击事件,向上级发送数据, 注意input-value是v-model绑定的初始值
    emit('changeBasicFormParam', props.param, v.value);
  };
  const changed = (event: boolean): void => {
    v.value = event === true;
  };

  onMounted(() => {
    if (Object.prototype.hasOwnProperty.call(props.param, 'default'))
      emit('changeBasicFormParam', props.param, props.param.default);
    if (Object.prototype.hasOwnProperty.call(props.param, 'value'))
      emit('changeBasicFormParam', props.param, props.param.value);
  });
</script>
