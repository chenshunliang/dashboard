/*
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
 */

import Ajv from 'ajv';

import { getValueSchema, getValue, deleteValue, setValue } from './yaml';

const isHiddle = (appValues: any, allParams: any, param: any) => {
  const hidden = param.hidden;
  switch (typeof hidden) {
    case 'string':
      return evalCondition(appValues, allParams, hidden);
    case 'object':
      // Two type of supported objects
      // A single condition: {value: string, path: any}
      // An array of conditions: {conditions: Array<{value: string, path: any}, operator: string}
      if (hidden.conditions?.length > 0) {
        switch (hidden.operator) {
          case 'and':
            // Every value matches the referenced
            // value (via jsonpath) in all the conditions 每个条件返回值为真时隐藏
            return hidden.conditions.every((c) => evalCondition(appValues, allParams, c.path, c.value));
          case 'or':
            // It is enough if the value matches the referenced
            // value (via jsonpath) in any of the conditions 只要有一个条件返回值为真时隐藏
            return hidden.conditions.some((c) => evalCondition(appValues, allParams, c.path, c.value));
          case 'nor':
            // Every value mismatches the referenced
            // value (via jsonpath) in any of the conditions 或非, 与and相反, 所有条件返回值为假时隐藏
            return hidden.conditions.every((c) => !evalCondition(appValues, allParams, c.path, c.value));
          case 'not':
            // 非, 与对应的枚举类型关联
            return hidden.conditions.every((c) => evalConditionNot(appValues, allParams, c.path, c.value));
          default:
            // we consider 'and' as the default operator  默认,每个条件返回值为真时隐藏
            return hidden.conditions.every((c) => evalCondition(appValues, allParams, c.path, c.value));
        }
      } else {
        return evalCondition(appValues, allParams, hidden.path, hidden.value);
      }
    case 'undefined':
      return false;
    default:
      return false;
  }
};

const evalCondition = (appValues: any, allParams: any, path: string, expectedValue: any = null): boolean => {
  // 从最新的appValues中获取路径对应的值
  let val = getValue(appValues, path);
  if (val === undefined || val === null) {
    const target = getParamMatchingPath(allParams, path.replaceAll('.', '/'));
    val = target?.value;
  }
  return val === (expectedValue ?? true);
};

const evalConditionNot = (appValues: any, allParams: any, path: string, expectedValue: any = null): boolean => {
  let val = getValue(appValues, path);
  if (val === undefined) {
    const target = getParamMatchingPath(allParams, path);
    val = target?.value;
    if (val === undefined) {
      const target = getParamMatchingPath(allParams, path);
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

export const retrieveFromSchema = (
  defaultValues: { [key: string]: any },
  schema: { [key: string]: any },
  parentPath = '',
  forceRender = false,
): any => {
  let params = [];
  if (schema && schema.properties) {
    const properties = schema.properties;
    Object.keys(properties).forEach((propertyKey) => {
      const itemPath = `${parentPath || ''}${propertyKey}`;
      const { type, form } = properties[propertyKey];
      if (form || forceRender) {
        // Use the default value either from the JSON schema or the default values
        // 使用schema中的默认值
        // const value = properties[propertyKey].default
        // 使用values.yaml的默认值

        const value = getValueSchema(defaultValues, itemPath, properties[propertyKey].default);
        let children: any = undefined;
        if (properties[propertyKey].type === 'object') {
          children = retrieveFromSchema(defaultValues, properties[propertyKey], `${itemPath}/`, forceRender);
        }
        let enumItems = undefined;
        enumItems = properties[propertyKey].enum?.map((item) => item ?? '');
        if (properties[propertyKey].type === 'array' && Array.isArray(properties[propertyKey].items)) {
          enumItems = properties[propertyKey].items?.map((item) => item ?? item.value ?? item.default ?? '');
        }
        const param = {
          ...properties[propertyKey],
          path: itemPath,
          name: propertyKey,
          type: type,
          value: value,
          enum: enumItems,
          children: children,
        };
        params = params.concat(param);
      } else {
        // form为假不渲染
        // If the property is an object, iterate recursively 递归遍历
        if (schema.properties[propertyKey].type !== 'object') {
          params = params.concat(
            retrieveFromSchema(defaultValues, properties[propertyKey], `${itemPath}/`, forceRender),
          );
        }
      }
    });
  }
  return params;
};

export const validateJsonSchema = (schema: { [key: string]: any }, data: { [key: string]: any }): boolean => {
  if (!data) return false;
  if (!schema) return true;
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    return false;
  }
  return true;
};

export const convertObjectToArray = (data: { [key: string]: any }): { [key: string]: any } => {
  const newdata = {};
  for (const item in data) {
    if (data[item] === null) continue;
    if (JSON.stringify(data[item]) === '{}') {
      newdata[item] = {};
    }
    if (JSON.stringify(data[item]) === '[]') {
      newdata[item] = [];
    }
    if (typeof data[item] === 'string') {
      newdata[item] = data[item].trim();
    } else if (data[item] instanceof Array) {
      newdata[item] = [];
      data[item].forEach((d) => {
        if (typeof d === 'object') {
          newdata[item].push(convertObjectToArray(d));
        } else {
          newdata[item].push(d);
        }
      });
    } else if (data[item] instanceof Object) {
      let allNumber = true;
      Object.keys(data[item]).forEach((k) => {
        if (isNaN(k as any)) {
          allNumber = false;
          return;
        }
      });
      if (allNumber && JSON.stringify(data[item]) !== '{}') {
        const _d = [];
        Object.keys(data[item]).forEach((k) => {
          _d.push(data[item][k]);
        });
        newdata[item] = _d;
        newdata[item].forEach((d) => {
          if (typeof d === 'object') {
            newdata[item].push(convertObjectToArray(d));
          } else {
            newdata[item].push(d);
          }
        });
      } else {
        newdata[item] = convertObjectToArray(data[item]);
      }
    } else {
      newdata[item] = data[item];
    }
  }
  return newdata;
};

export const deleteHiddenParams = (
  defaultValues: { [key: string]: any },
  schema: { [key: string]: any },
  parentPath = '',
): any => {
  if (schema && schema.properties) {
    const properties = schema.properties;
    Object.keys(properties).forEach((propertyKey) => {
      const itemPath = `${parentPath || ''}${propertyKey}`;

      // const value = getValueSchema(defaultValues, itemPath, properties[propertyKey].default);
      if (properties[propertyKey].type === 'object') {
        defaultValues = deleteHiddenParams(defaultValues, properties[propertyKey], `${itemPath}/`);
      }

      if (isHiddle(defaultValues, schema, properties[propertyKey])) {
        defaultValues = deleteValue(defaultValues, itemPath);
      }
    });
  }

  return defaultValues;
};
