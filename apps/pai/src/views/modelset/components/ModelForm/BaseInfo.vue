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
  <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
    <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('resource.model')])" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.displayName"
            :label="i18nLocal.t('tip.display_name')"
            required
            :rules="objRules.displayName"
            @input="
              () => {
                if (!edit) obj.name = obj.displayName;
              }
            "
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.trim="obj.name"
            :label="i18nLocal.t('tip.model_name')"
            :readonly="edit"
            required
            :rules="objRules.name"
          />
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="modelType"
            color="primary"
            :items="modelTypeItems"
            :label="i18nLocal.t('tip.model_type')"
            :no-data-text="i18n.t('data.no_data')"
            :rules="objRules.dataType"
            @change="modelTypeChanged"
          >
            <template #item="{ item }">
              <BaseLogo
                class="mr-2"
                :color="store.state.ThemeColor"
                :icon-name="item.icon"
                :ml="0"
                :mt="1"
                :width="20"
              />
              {{ item.text }}
            </template>
            <template #selection="{ item }">
              <v-chip color="primary" small>
                <BaseLogo class="mr-2" :icon-name="item.icon" :ml="0" :mt="1" :width="20" />
                {{ item.text }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="obj.description"
            auto-grow
            :label="i18nLocal.t('tip.model_desc')"
            required
            :rules="objRules.description"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model.trim="targetPath"
            :label="i18nLocal.t('tip.model_mount')"
            required
            :rules="objRules.targetPath"
            @keyup="inputTargetPath"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.trim="obj.config.capacity"
            :label="i18nLocal.t('tip.model_capacity')"
            required
            :rules="objRules.capacity"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { name, required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { PAI_MODALSET_CATALOG_KEY, PAI_SET_MOUNT_PATH_KEY } from '@kubegems/libs/constants/label';
  import { reactive, ref, watch } from 'vue';

  import { Modelset } from '../../../../api/modelset';
  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      set?: Modelset;
      edit?: boolean;
    }>(),
    {
      set: void 0,
      edit: false,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    valid: false,
  });

  const modelType = ref('');
  const modelTypeItems = [
    { text: 'pytorch', value: 'pytorch', icon: 'pytorch' },
    { text: 'transformers', value: 'transformers', icon: 'transformers' },
    { text: 'tensorflow', value: 'tensorflow', icon: 'tensorflow' },
    // { text: 'onnx', value: 'onnx', icon: 'onnx' },
    { text: 'keras', value: 'keras', icon: 'keras' },
    { text: i18nLocal.t('tab.other'), value: 'other', icon: 'modelgeneric' },
  ];
  const modelTypeChanged = (): void => {
    obj.value.labels = Object.assign(obj.value.labels, {
      [PAI_MODALSET_CATALOG_KEY]: modelType.value,
    });
  };

  const targetPath = ref('/datas/models');
  const inputTargetPath = (): void => {
    obj.value.annotations = Object.assign(obj.value.annotations || {}, {
      [PAI_SET_MOUNT_PATH_KEY]: targetPath.value,
    });
  };

  const obj = ref<Modelset>(props.set);
  const objRules = {
    name: [required, name],
    displayName: [required],
    description: [],
    dataType: [required],
    targetPath: [required, (v) => new RegExp('^/').test(v) || i18nLocal.t('ruler.abs_path')],
    capacity: [required, (v) => !!new RegExp('(^\\d+[G|T]i$)|(^0$)').test(v) || i18nLocal.t('ruler.capacity_rule')],
  };

  watch(
    () => props.set,
    (newValue) => {
      if (newValue) {
        obj.value = newValue;
        inputTargetPath();
        targetPath.value = obj.value.annotations?.[PAI_SET_MOUNT_PATH_KEY] || '/datas/models';
        modelType.value = obj.value.labels?.[PAI_MODALSET_CATALOG_KEY];
        const [download] = obj.value.downloaders;
        if (download?.kind === 'HuggingFace') {
          obj.value.name = download.config.name;
        } else if (download?.kind === 'ModelX') {
          const reg = new RegExp('.*?(\\/.*)@.*', 'g');
          const matchs = reg.exec(download.config.url);
          const name = matchs?.[1];
          obj.value.name = name || '';
        }
      }
    },
    { deep: true, immediate: true },
  );

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate();
  };

  const reset = (): void => {
    form.value.resetValidation();
    obj.value = new Modelset();
    targetPath.value = '/datas/models';
    modelType.value = '';
  };

  defineExpose({
    validate,
    reset,
  });
</script>
