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
  <v-card class="pa-3 mt-3" :outlined="outliend" :style="{ backgroundColor: pathLevel > 1 ? 'rgba(0,0,0,0.03)' : '' }">
    <v-flex class="my-0 mt-0">
      <BaseSubTitle
        class="my-0 mt-0"
        :color="pathLevel === 1 ? 'kubegems__sub_title_bg' : pathLevel > 1 ? '' : ''"
        :divider="false"
        :freeze="pathLevel !== 1"
        in-form
        :pl="pathLevel >= 1 ? 2 : 0"
        :title="label"
      />

      <v-flex
        v-if="param.children && param.children.length > 0"
        class="my-0 mt-0"
        :style="{ paddingLeft: `${4 * pathLevel}px` }"
      >
        <v-row class="mt-0">
          <template v-for="(childrenParam, index) in param.children">
            <v-col v-if="!isHiddle(childrenParam.hidden)" :key="`${id}-${index}`" :cols="param.cols || cols">
              <BaseParam
                :id="`${id}-${index}`"
                :key="`${id}-${index}`"
                :all-params="allParams"
                :allow-delete="allowDelete"
                :app-values="appValues"
                class="my-0 mt-0"
                :cluster-name="clusterName"
                :param="childrenParam"
                v-bind="$attrs"
                v-on="$listeners"
              />
            </v-col>
          </template>
        </v-row>
      </v-flex>
    </v-flex>
  </v-card>
</template>

<script lang="ts" setup>
  import { getValue } from '@kubegems/libs/utils/yaml';
  import { ComputedRef, computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      id?: string;
      label?: string;
      param?: any;
      level?: number;
      clusterName?: string;
      allParams?: any[];
      appValues?: any;
      allowDelete?: boolean;
      cols?: number;
      outliend?: boolean;
    }>(),
    {
      id: undefined,
      label: '',
      param: {},
      level: 1,
      clusterName: '',
      allParams: undefined,
      appValues: {},
      allowDelete: false,
      cols: 12,
      outliend: false,
    },
  );

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const isHiddle = (hidden) => {
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
  };

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
