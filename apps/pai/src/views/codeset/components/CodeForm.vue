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
    icon="mdi-code-json"
    :title="
      state.edit
        ? i18n.t('operate.update_c', [i18nLocal.t('resource.codeset')])
        : i18n.t('operate.create_c', [i18nLocal.t('resource.codeset')])
    "
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="i18nLocal.t('tip.codeset_conf')" />
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
                    if (!state.edit) obj.name = obj.displayName;
                  }
                "
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.name"
                :label="i18nLocal.t('tip.code_name')"
                :readonly="state.edit"
                required
                :rules="objRules.name"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="obj.description"
                auto-grow
                :label="i18nLocal.t('tip.code_desc')"
                required
                :rules="objRules.description"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.trim="targetPath"
                :label="i18nLocal.t('tip.code_mount')"
                required
                :rules="objRules.targetPath"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.config.capacity"
                :label="i18nLocal.t('tip.code_capacity')"
                required
                :rules="objRules.capacity"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <BaseSubTitle :title="i18nLocal.t('tip.git_conf')" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model.trim="obj.config.addr"
                :label="i18nLocal.t('tip.git_address')"
                required
                :rules="objRules.repo"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.config.branch"
                :label="i18nLocal.t('tip.branch')"
                required
                :rules="objRules.branch"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-switch v-model="state.needAuth" hide-details :label="i18nLocal.t('tip.auth')" />
            </v-col>
          </v-row>
          <v-row v-if="state.needAuth">
            <v-col cols="6">
              <v-text-field
                v-model="obj.config.username"
                :label="i18nLocal.t('tip.git_user')"
                required
                :rules="objRules.username"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="obj.config.password"
                :label="i18nLocal.t('tip.secret')"
                required
                :rules="objRules.password"
                type="password"
              />
            </v-col>
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
  import { name, required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { PAI_SET_MOUNT_PATH_KEY } from '@kubegems/libs/constants/label';
  import { reactive, ref } from 'vue';

  import { Codeset } from '../../../api/codeset';
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
    needAuth: false,
  });

  const obj = ref<Codeset>(new Codeset());
  const objRules = {
    name: [required, name],
    displayName: [required],
    description: [],
    repo: [required],
    username: [required],
    password: [required],
    targetPath: [required, (v) => new RegExp('^/').test(v) || i18nLocal.t('ruler.abs_path')],
    branch: [],
    capacity: [required, (v) => !!new RegExp('(^\\d+[G|T]i$)|(^0$)').test(v) || i18nLocal.t('ruler.capacity_rule')],
  };

  const targetPath = ref('/datas/code');

  const reset = (): void => {
    state.dialog = false;
    obj.value = new Codeset();
    state.edit = false;
    form.value.resetValidation();
    state.needAuth = false;
    targetPath.value = '/datas/code';
  };

  const open = (): void => {
    state.dialog = true;
  };
  const init = async (item: Codeset): Promise<void> => {
    state.edit = true;
    const data = await new Codeset(item).getCodeset();
    obj.value = data;
    targetPath.value = obj.value.annotations?.[PAI_SET_MOUNT_PATH_KEY];
    state.needAuth = Boolean(obj.value.config.username) && Boolean(obj.value.config.password);
  };
  defineExpose({
    open,
    init,
  });

  const form = ref<any>(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      obj.value.region = store.getters.Region().RegionName;
      obj.value.tenant = store.getters.Tenant().TenantName;
      obj.value.annotations = Object.assign(obj.value.annotations || {}, {
        [PAI_SET_MOUNT_PATH_KEY]: targetPath.value,
      });
      if (state.edit) {
        await new Codeset(obj.value).updateCodeset();
      } else {
        await new Codeset(obj.value).addCodeset();
      }
      emit('refresh');
      reset();
    }
  };
</script>
