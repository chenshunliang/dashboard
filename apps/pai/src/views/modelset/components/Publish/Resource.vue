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
    <BaseSubTitle :title="i18nLocal.t('tip.image_conf')" />
    <v-card-text class="pa-2">
      <v-row v-if="obj.config">
        <v-col cols="12">
          <v-text-field
            v-model="obj.config.extraInfo.inferenceImage"
            :label="i18nLocal.t('tip.inference_image')"
            required
            :rules="objRules.inferenceImage"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="obj.config.extraInfo.mountPath"
            :label="i18nLocal.t('tip.model_mount')"
            required
            :rules="objRules.mountPath"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <BaseSubTitle :title="i18nLocal.t('tip.resource_conf')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field v-model="obj.config.extraInfo.request.cpu" label="CPU" required :rules="objRules.cpu" />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.extraInfo.request.memory"
            :label="i18nLocal.t('tip.memory')"
            required
            :rules="objRules.memory"
          />
        </v-col>
        <v-col cols="12">
          <v-switch v-model="needGpu" hide-details :label="i18nLocal.t('tip.needGpu')" />
        </v-col>
        <template v-if="needGpu">
          <v-col cols="6">
            <v-text-field
              v-model="obj.config.extraInfo.request['nvidia.com/gpu']"
              label="GPU"
              required
              :rules="objRules.gpu"
            />
          </v-col>
        </template>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { positiveInteger, required } from '@kubegems/extension/ruler';
  import { reactive, ref } from 'vue';

  import { AsyncTask } from '../../../../api/task';
  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      task?: AsyncTask;
    }>(),
    {
      task: void 0,
    },
  );

  const obj = ref<AsyncTask>(props.task);
  const objRules = {
    inferenceImage: [required],
    mountPath: [required, (v) => !!new RegExp('^/').test(v) || i18nLocal.t('ruler.abs_path')],
    cpu: [required, (v) => !!new RegExp('(^\\d+m?$)|(^0$)').test(v) || i18nLocal.t('ruler.cpu_rule')],
    memory: [required, (v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || i18nLocal.t('ruler.memory_rule')],
    gpu: [required, positiveInteger],
  };

  const i18nLocal = useI18n();

  const state = reactive({
    valid: false,
  });

  const needGpu = ref(false);

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate();
  };

  const reset = (): void => {
    form.value.resetValidation();
  };

  defineExpose({
    validate,
    reset,
  });
</script>
