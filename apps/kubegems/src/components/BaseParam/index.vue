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
  <!-- 1级对象列宽为一半,其他全宽 -->
  <v-flex v-if="!isHiddle" class="pb-1">
    <!-- 对象子组件 -->
    <Subsection
      v-if="type === 'object'"
      :id="id"
      :all-params="allParams"
      :app-values="appValues"
      :cluster-id="clusterId"
      :cluster-name="clusterName"
      :cols="param.cols || cols"
      :label="param.title || param.path"
      :level="level"
      :outliend="outliend"
      :param="param"
      :path-level="pathLevel"
      :tenant-id="tenantId"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <!-- 布尔组件 -->
    <BooleanParam
      v-else-if="type === 'boolean'"
      :id="id"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <RadioParam
      v-else-if="type === 'string' && param.enum && param.enum.length > 0 && param.render === 'radio'"
      :id="id"
      v-bind="$attrs"
      :input-type="inputType"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-on="$listeners"
    />
    <!-- 单选组件(枚举/存储类) -->
    <SingleSelectParam
      v-else-if="
        (type === 'string' || type === 'integer') &&
        ((param.enum && param.enum.length > 0) ||
          param.name === 'storageClassName' ||
          param.name === 'storageClass' ||
          param.name === 'ingressClassName' ||
          param.name === 'ingressClass')
      "
      :id="id"
      v-bind="$attrs"
      :cluster-id="clusterId"
      :cluster-name="clusterName"
      :input-type="inputType"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      :tenant-id="tenantId"
      v-on="$listeners"
    />
    <MinMaxParam
      v-else-if="type === 'integer' && param.render && param.render === 'slider'"
      :id="id"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <!-- 滑块带范围的组件 -->
    <SliderParam
      v-else-if="
        (type === 'integer' || type === 'number') &&
        Object.prototype.hasOwnProperty.call(param, 'minimum') &&
        Object.prototype.hasOwnProperty.call(param, 'maximum')
      "
      :id="id"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <!-- 文本框组件(排除滑块类) -->
    <TextFieldParam
      v-else-if="
        (type === 'string' &&
          !param.render &&
          !param.enum &&
          !param['x-remote-enum'] &&
          param.name !== 'storageClassName' &&
          param.name !== 'storageClass' &&
          param.name !== 'ingressClassName' &&
          param.name !== 'ingressClass' &&
          param.name !== 'nameOverride' &&
          param.name !== 'fullnameOverride') ||
        type === 'integer' ||
        type === 'number'
      "
      :id="id"
      :allow-delete="allowDelete"
      :input-type="inputType"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <!-- 多选组件 -->
    <MultiSelectParam
      v-else-if="type === 'array' && !param['x-remote-enum']"
      :id="id"
      v-bind="$attrs"
      :app-values="appValues"
      :cluster-name="clusterName"
      :input-type="inputType"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-on="$listeners"
    />
    <!-- 文本框组件 -->
    <TextAreaParam
      v-else-if="type === 'string' && param.render && param.render === 'textArea'"
      :id="id"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <CardOrTableParam
      v-else-if="(type === 'string' || type === 'array') && param['x-remote-enum']"
      :id="id"
      :label="param.title || param.path"
      :level="level"
      :param="param"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </v-flex>
</template>

<script lang="ts" setup>
  import { getValue } from '@kubegems/libs/utils/yaml';
  import { ComputedRef, computed } from 'vue';

  import BooleanParam from './BooleanParam.vue';
  import CardOrTableParam from './CardOrTableParam.vue';
  import MinMaxParam from './MinMaxParam.vue';
  import MultiSelectParam from './MultiSelectParam.vue';
  import RadioParam from './RadioParam.vue';
  import SingleSelectParam from './SingleSelectParam.vue';
  import SliderParam from './SliderParam.vue';
  import Subsection from './Subsection.vue';
  import TextAreaParam from './TextAreaParam.vue';
  import TextFieldParam from './TextFieldParam.vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      param?: any;
      level?: number;
      clusterName?: string;
      allParams?: any[];
      appValues?: any;
      allowDelete?: boolean;
      clusterId?: number;
      tenantId?: number;
      cols?: number;
      outliend?: boolean;
    }>(),
    {
      id: undefined,
      param: {},
      level: 1,
      clusterName: '',
      allParams: undefined,
      appValues: {},
      allowDelete: false,
      clusterId: 0,
      tenantId: 0,
      cols: 12,
      outliend: false,
    },
  );

  const isHiddle: ComputedRef<boolean> = computed(() => {
    const hidden = props.param.hidden;
    switch (typeof hidden) {
      case 'string':
        return evalCondition(hidden);
      case 'object':
        // Two type of supported objects
        // A single condition: {value: string, path: any}
        // An array of conditions: {conditions: Array<{value: string, path: any}, operator: string}
        if (hidden.conditions?.length > 0) {
          switch (hidden.operator) {
            case 'and':
              // Every value matches the referenced
              // value (via jsonpath) in all the conditions 每个条件返回值为真时隐藏
              return hidden.conditions.every((c) => evalCondition(c.path, c.value));
            case 'or':
              // It is enough if the value matches the referenced
              // value (via jsonpath) in any of the conditions 只要有一个条件返回值为真时隐藏
              return hidden.conditions.some((c) => evalCondition(c.path, c.value));
            case 'nor':
              // Every value mismatches the referenced
              // value (via jsonpath) in any of the conditions 或非, 与and相反, 所有条件返回值为假时隐藏
              return hidden.conditions.every((c) => !evalCondition(c.path, c.value));
            case 'not':
              // 非, 与对应的枚举类型关联
              return hidden.conditions.every((c) => evalConditionNot(c.path, c.value));
            default:
              // we consider 'and' as the default operator  默认,每个条件返回值为真时隐藏
              return hidden.conditions.every((c) => evalCondition(c.path, c.value));
          }
        } else {
          return evalCondition(hidden.path, hidden.value);
        }
      case 'undefined':
        return false;
      default:
        return false;
    }
  });

  const type: ComputedRef<string> = computed(() => {
    return Array.isArray(props.param.type) ? props.param.type[0] : props.param.type;
  });

  const inputType: ComputedRef<string> = computed(() => {
    const label = props.param.title || props.param.path || '';
    let inputType = 'string';
    if (type.value === 'integer' || type.value === 'number') {
      inputType = 'number';
    }
    if (
      type.value === 'string' &&
      (props.param.render === 'password' || label.toLocaleLowerCase().includes('password'))
    ) {
      inputType = 'password';
    }
    return inputType;
  });

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const evalCondition = (path: string, expectedValue: any = null): boolean => {
    // 从最新的appValues中获取路径对应的值
    let val = getValue(props.appValues, path);
    if (val === undefined || val === null) {
      const target = getParamMatchingPath(props.allParams, path.replaceAll('.', '/'));
      val = target?.value;
    }
    return val === (expectedValue ?? true);
  };

  const evalConditionNot = (path: string, expectedValue: any = null): boolean => {
    let val = getValue(props.appValues, path);
    if (val === undefined) {
      const target = getParamMatchingPath(props.allParams, path);
      val = target?.value;
      if (val === undefined) {
        const target = getParamMatchingPath(props.allParams, path);
        val = target?.value;
      }
    }
    // 不相等则返回真,表示隐藏该属性
    return val !== expectedValue;
  };

  // 递归获取匹配路径的参数
  const getParamMatchingPath = (params: { [key: string]: any }[], path: string) => {
    for (const p of params) {
      if (p.path === path) {
        return p;
      } else if (p.children && p.children?.length > 0) {
        const pp = getParamMatchingPath(p.children, path);
        if (pp) return pp;
        else continue;
      } else {
        continue;
      }
    }
  };
</script>
