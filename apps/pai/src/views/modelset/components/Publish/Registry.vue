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
    <BaseSubTitle :title="i18nLocal.t('tip.registry_conf')" />
    <v-card-text class="pa-2">
      <v-row v-if="obj.config">
        <v-col cols="12">
          <v-text-field v-model="obj.config.url" :label="i18nLocal.t('tip.registry')" required :rules="objRules.url" />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="obj.config.token"
            :append-icon="state.showToken ? 'mdi-eye' : 'mdi-eye-off'"
            :label="i18nLocal.t('tip.token')"
            required
            :rules="objRules.token"
            :type="state.showToken ? 'text' : 'password'"
            @click:append="state.showToken = !state.showToken"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/extension/ruler';
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
    url: [required],
    token: [required],
  };

  const i18nLocal = useI18n();

  const state = reactive({
    valid: false,
    showToken: false,
  });

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
