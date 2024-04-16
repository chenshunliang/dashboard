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
    icon="mdi-home"
    :title="
      state.edit
        ? i18n.t('operate.update_c', [i18nLocal.t('resource.workspace')])
        : i18n.t('operate.create_c', [i18nLocal.t('resource.workspace')])
    "
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('resource.workspace')])" />
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
                :label="i18nLocal.t('tip.workspace_name')"
                :readonly="state.edit"
                required
                :rules="objRules.name"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="obj.description"
                auto-grow
                :label="i18nLocal.t('tip.workspace_desc')"
                required
                :rules="objRules.description"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.trim="targetPath"
                :label="i18nLocal.t('tip.workspace_mount')"
                required
                :rules="objRules.targetPath"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.config.capacity"
                :label="i18nLocal.t('tip.workspace_capacity')"
                required
                :rules="objRules.capacity"
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

  import { Workspace } from '../../../api/workspace';
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
  });

  const obj = ref<Workspace>(new Workspace());
  const objRules = {
    name: [required, name],
    displayName: [required],
    description: [],
    targetPath: [required, (v) => new RegExp('^/').test(v) || i18nLocal.t('ruler.abs_path')],
    capacity: [required, (v) => !!new RegExp('(^\\d+[G|T]i$)|(^0$)').test(v) || i18nLocal.t('ruler.capacity_rule')],
  };

  const targetPath = ref('/datas/workspaces');

  const open = (): void => {
    state.dialog = true;
  };
  const init = async (item: Workspace): Promise<void> => {
    state.edit = true;
    obj.value = await new Workspace(item).getWorkspace();
    targetPath.value = obj.value.annotations?.[PAI_SET_MOUNT_PATH_KEY];
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      obj.value.tenant = store.getters.Tenant().TenantName;
      obj.value.region = store.getters.Region().RegionName;
      obj.value.annotations = Object.assign(obj.value.annotations || {}, {
        [PAI_SET_MOUNT_PATH_KEY]: targetPath.value,
      });
      if (state.edit) {
        await new Workspace(obj.value).updateWorkspace();
      } else {
        await new Workspace(obj.value).addWorkspace();
      }
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    state.edit = false;
    form.value.resetValidation();
    obj.value = new Workspace();
    targetPath.value = '/datas/workspaces';
  };
</script>
