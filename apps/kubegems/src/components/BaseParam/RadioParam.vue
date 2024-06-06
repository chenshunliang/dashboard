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

    <div>{{ pathLevel === 1 ? '' : labelWithDesc }}</div>
    <v-radio-group
      :id="id"
      class="my-2"
      hide-details
      row
      :rules="rules"
      :value="param.value || param.default"
      @change="changed($event)"
    >
      <v-radio v-for="(item, index) in items" :key="index" :value="item.value">
        <template #label>
          <img v-if="useLogoImage(item.text)" class="mr-2" :src="useLogoImage(item.text)" width="24px" />
          {{ item.text }}
        </template>
      </v-radio>
    </v-radio-group>
  </v-flex>
</template>

<script lang="ts" setup>
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

  const useLogoImage = (name: string) => {
    switch (name?.toLocaleLowerCase()?.replaceAll('-', '')?.replaceAll('_', '')) {
      case 'llamafactory':
        return '/icon/common/llama-factory.png';
      case 'megatron':
        return '/icon/common/megatron.png';
      case 'deepspeed':
        return '/icon/common/deepspeed.png';
      case 'mindspore':
        return '/icon/common/mindspore.png';
      case 'colossalai':
        return '/icon/common/colossal-ai.png';
      case 'huggingface':
        return '/icon/transform.svg';
      case 'fsdp':
        return '/icon/pytorch-icon.svg';
      default:
        return '';
    }
  };

  const pathLevel: ComputedRef<number> = computed(() => {
    if (props.param?.path?.indexOf('/') > -1) return props.param.path.split('/').length;
    if (props.param?.path?.indexOf('.') > -1) return props.param.path.split('.').length;
    return props.level;
  });

  const labelWithDesc = computed(() => {
    if (props.param.description) {
      return `${props.label}(${props.param.description})`;
    } else {
      return props.label;
    }
  });

  const rules = [required];

  const emit = defineEmits(['changeBasicFormParam']);
  const changed = (event: string): void => {
    emit('changeBasicFormParam', props.param, event);
  };

  const items = ref([]);
  onMounted(() => {
    if (props.param.enum && props.param.enum.length > 0) {
      items.value = props.param.enum.map((enumValue) => {
        return { text: enumValue, value: enumValue };
      });
    }

    emit('changeBasicFormParam', props.param, props.param.default);
  });
</script>
