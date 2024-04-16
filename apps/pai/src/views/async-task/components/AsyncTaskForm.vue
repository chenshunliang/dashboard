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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-file-tree"
    :title="i18n.t('operate.update_c', [i18nLocal.t('resource.async_task')])"
    :width="800"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="obj.kind ? i18nLocal.t(`tip.${obj.kind.toLocaleLowerCase()}_conf`) : ''" />
        <v-card-text class="pa-2">
          <v-row>
            <template v-if="obj.kind === 'ModelX'">
              <v-col cols="12">
                <v-text-field
                  v-model.trim="obj.config.url"
                  :label="i18nLocal.t('tip.modelx_url')"
                  required
                  :rules="objRules.modelx_url"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.trim="obj.config.token"
                  :append-icon="state.showToken ? 'mdi-eye' : 'mdi-eye-off'"
                  :label="i18nLocal.t('tip.modelx_token')"
                  required
                  :type="state.showToken ? 'text' : 'password'"
                  @click:append="state.showToken = !state.showToken"
                />
              </v-col>
            </template>
            <template v-else-if="obj.kind === 'HuggingFace'">
              <v-col cols="12">
                <v-text-field
                  v-model.trim="obj.config.name"
                  :label="i18nLocal.t('tip.huggingface_name')"
                  required
                  :rules="objRules.huggingface_name"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.trim="obj.config.token"
                  :append-icon="state.showToken ? 'mdi-eye' : 'mdi-eye-off'"
                  :label="i18nLocal.t('tip.huggingface_token')"
                  required
                  :type="state.showToken ? 'text' : 'password'"
                  @click:append="state.showToken = !state.showToken"
                />
              </v-col>
            </template>
            <template v-else-if="obj.kind === 'Default'">
              <v-col>
                <v-textarea
                  v-model="obj.config.script"
                  auto-grow
                  :label="i18nLocal.t('tip.script')"
                  required
                  :rules="objRules.script"
                />
              </v-col>
            </template>
            <template v-else-if="obj.kind === 'URI'">
              <v-col>
                <v-textarea
                  v-model="obj.config.urls"
                  auto-grow
                  :label="i18nLocal.t('tip.urls')"
                  required
                  :rules="objRules.urls"
                />
              </v-col>
            </template>
          </v-row>
        </v-card-text>
      </v-form>
    </template>
    <template #action>
      <v-btn class="float-right mx-2" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useMeta } from '@kubegems/extension/router';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { computed, reactive, ref } from 'vue';

  import { Region } from '../../../api/region';
  import { AsyncTask } from '../../../api/task';
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      region?: Region;
    }>(),
    {
      region: void 0,
    },
  );

  const state = reactive({
    dialog: false,
    valid: false,
    showToken: false,
  });

  const obj = ref<AsyncTask>(new AsyncTask());
  const objRules = {
    modelx_url: [required],
    huggingface_name: [required],
    huggingface_token: [required],
    script: [required],
    urls: [
      required,
      (v) =>
        !v ||
        !!new RegExp('^(http[s]?://[-1-9a-zA-Z_#\\*\\.:@]+;?)+$', 'gi').test(v.trim()) ||
        i18nLocal.t('ruler.uri'),
    ],
  };

  const open = (): void => {
    state.dialog = true;
  };
  const init = async (item: AsyncTask): Promise<void> => {
    obj.value = deepCopy(item);
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);

  const isAdmin = computed(() => {
    return (useMeta() as any)?.admin;
  });
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      isAdmin
        ? await new AsyncTask({ ...obj.value, region: props.region.name }).updateAdminTask()
        : await new AsyncTask({ ...obj.value, region: props.region.name }).updateTask();
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.resetValidation();
    obj.value = new AsyncTask();
  };
</script>
