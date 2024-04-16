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
    :title="i18nLocal.t('operate.change_priority')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('tip.priority')])" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="obj.config.priority"
                color="primary"
                :items="priorityItems"
                :label="i18nLocal.t('tip.priority')"
                :no-data-text="i18n.t('data.no_data')"
                :rules="objRules.priority"
              >
                <template #selection="{ item }">
                  <v-chip color="primary" small>
                    {{ item.text }}
                  </v-chip>
                </template>
              </v-autocomplete>
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
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { Job } from '../../../api/job';
  import { Priority } from '../../../api/priority';
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  const obj = ref<Job>(new Job());
  const objRules = {
    priority: [required],
  };
  const priorityItems = ref([]);
  const getPriorityList = async (): Promise<void> => {
    const data = await new Priority({ region: store.getters.Region().RegionName }).getPriorityList();
    priorityItems.value = data.map((item) => ({
      text: item.name,
      value: item.name,
    }));
  };

  const open = (): void => {
    state.dialog = true;
  };
  const init = async (item: Job): Promise<void> => {
    getPriorityList();
    obj.value = await new Job(item).getJob();
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const reset = (): void => {
    state.dialog = true;
    obj.value = new Job();
    form.value.resetValidation();
  };

  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      await new Job(obj.value).updateJob();
      reset();
      emit('refresh');
    }
  };
</script>
