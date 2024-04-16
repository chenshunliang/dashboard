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
    icon="mdi-priority-high"
    :title="i18n.t('operate.add_c', [i18nLocal.t('resource.priority')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="i18nLocal.t('tip.basic')" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.name"
                :label="i18nLocal.t('tip.priority_name')"
                :readonly="state.edit"
                required
                :rules="objRules.name"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="obj.description"
                auto-grow
                :label="i18nLocal.t('tip.priority_desc')"
                required
                :rules="objRules.description"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <BaseSubTitle :title="i18nLocal.t('tip.priority_conf')" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="obj.weight"
                :label="i18nLocal.t('tip.priority_weight')"
                required
                :rules="objRules.weight"
                type="number"
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
  import { name, positiveInteger, required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { Priority } from '../../../api/priority';
  import { Region } from '../../../api/region';
  import { useI18n } from '../i18n';

  const props = withDefaults(
    defineProps<{
      region?: Region;
    }>(),
    {
      region: void 0,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
  });

  const obj = ref<Priority>(new Priority());
  const objRules = {
    name: [required, name],
    description: [],
    weight: [required, positiveInteger],
  };

  const open = (): void => {
    state.dialog = true;
  };
  const init = async (item: Priority): Promise<void> => {
    obj.value = await new Priority(item).getPriority();
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      obj.value.region = props.region.name;
      if (state.edit) {
        await new Priority(obj.value).updatePriority();
      } else {
        await new Priority(obj.value).addPriority();
      }
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    state.edit = false;
    form.value.resetValidation();
    obj.value = new Priority();
  };
</script>
