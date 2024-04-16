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
    <BaseSubTitle :title="i18nLocal.t('tip.basic')" />
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
            v-model="obj.name"
            :label="i18nLocal.t('tip.name')"
            :readonly="edit"
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
            :label="i18nLocal.t('tip.desc')"
            required
            :rules="objRules.description"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <BaseSubTitle :title="i18nLocal.t('tip.base')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="4">
          <v-switch v-model="obj.config.preempt" hide-details :label="i18nLocal.t('tip.preempt')" :readonly="edit">
            <template #label>
              {{ i18nLocal.t('tip.preempt') }}
              <v-menu
                :close-delay="200"
                max-width="300"
                min-width="80"
                nudge-right="25px"
                nudge-top="-5px"
                open-on-hover
                top
              >
                <template #activator="{ on }">
                  <v-icon class="mt-1 ml-1" color="orange" small v-on="on">mdi-alert-decagram</v-icon>
                </template>
                <v-card>
                  <v-card-text class="pa-3 text-caption"> {{ i18nLocal.t('tip.preempt_tip') }} </v-card-text>
                </v-card>
              </v-menu>
            </template>
          </v-switch>
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { name, required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref, watch } from 'vue';

  import { Job } from '../../../../api/job';
  import { useI18n } from '../../i18n';

  const i18nLocal = useI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      job?: Job;
      edit?: boolean;
    }>(),
    {
      job: void 0,
      edit: false,
    },
  );

  watch(
    () => props.job,
    (newValue) => {
      if (props.edit && newValue.name) obj.value = newValue;
    },
    { deep: true },
  );

  const state = reactive({
    valid: false,
  });

  const obj = ref<Job>(props.job);
  obj.value.region = store.getters.Region().RegionName;
  const objRules = {
    displayName: [required],
    name: [required, name],
    description: [],
    region: [required],
    queue: [required],
    priority: [required],
  };

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate();
  };

  const reset = (): void => {
    form.value.resetValidation();
    obj.value = new Job();
  };

  defineExpose({
    validate,
    reset,
  });
</script>
