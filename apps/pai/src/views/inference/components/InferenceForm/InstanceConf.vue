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
    <v-flex :class="state.overlay ? 'kubegems__overlay' : ''" />
    <BaseSubTitle :title="i18nLocal.t('tip.task_conf')" />

    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model.number="obj.config.roles[0].replicas"
            :label="i18nLocal.t('tip.replicas')"
            required
            :rules="roleRule.replicas"
            type="number"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.spec')" />
    <v-card-text class="pa-2">
      <SpecTable v-model="obj.config.roles[0].sku" :job="job" />
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.image_conf')" />
    <v-card-text class="pa-2">
      <ImageConf v-model="obj.config.roles[0].image" :edit="edit" for="inference" @overlay="changeOverlayState" />
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.data_conf')" />
    <v-card-text class="pa-2">
      <SetMount v-model="obj.config.roles[0].volumeMountSets" @overlay="changeOverlayState" />
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.env')" />
    <v-card-text class="pa-2">
      <v-row class="mt-0">
        <v-col cols="12">
          <Env v-model="obj.config.roles[0].env" @overlay="changeOverlayState" />
        </v-col>
      </v-row>
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.port_conf')" />
    <v-card-text class="pa-2">
      <v-row class="mt-0">
        <v-col cols="12">
          <Port v-model="obj.config.roles[0].ports" @overlay="changeOverlayState" />
        </v-col>
      </v-row>
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.command')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <Command v-model="obj.config.roles[0].command" @overlay="changeOverlayState" />
        </v-col>
      </v-row>
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.advanced')" />
    <v-card-text class="pa-2">
      <v-switch v-model="state.advanced" class="float-left" hide-details :label="i18nLocal.t('tip.enabled')" />
      <div class="kubegems__clear-float" />
      <v-row v-if="state.advanced" class="mt-0">
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.roles[0].shmSize"
            :label="i18nLocal.t('tip.shmSize')"
            required
            :rules="roleRule.shmSize"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.roles[0].workingDir"
            :label="i18nLocal.t('tip.working_dir')"
            required
            :rules="roleRule.workingDir"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref, watch } from 'vue';

  import { Job } from '../../../../api/job';
  import Command from '../../../components/Command.vue';
  import Env from '../../../components/Env.vue';
  import ImageConf from '../../../components/ImageConf.vue';
  import Port from '../../../components/Port.vue';
  import SetMount from '../../../components/SetMount.vue';
  import SpecTable from '../../../components/SpecTable.vue';
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
      if (props.edit && newValue.name) {
        obj.value = newValue;
        state.advanced = Boolean(
          parseFloat(obj.value.config.roles?.[0]?.shmSize) || obj.value.config.roles?.[0]?.workingDir,
        );
      }
    },
    { deep: true },
  );

  const state = reactive({
    valid: false,
    overlay: false,
    advanced: false,
  });

  const changeOverlayState = (_overlay): void => {
    state.overlay = _overlay;
  };

  const obj = ref(props.job);
  const roleRule = {
    replicas: [required],
    shmSize: [(v) => !!new RegExp('(^\\d+[K|M|G|T]i$)|(^0$)').test(v) || i18nLocal.t('tip.storage_rule')],
    workingDir: [],
  };

  const form = ref<any>(null);
  const validate = (): boolean => {
    const valid = form.value.validate();
    if (!valid) return false;

    let v = true;
    obj.value.config.roles.forEach((r) => {
      if (!r.sku) {
        store.commit('SET_SNACKBAR', {
          text: i18nLocal.t('tip.sku_required', [r.name]),
          color: 'warning',
        });
        v = false;
        return;
      }
      if (!r.image) {
        store.commit('SET_SNACKBAR', {
          text: i18nLocal.t('tip.image_required', [r.name]),
          color: 'warning',
        });
        v = false;
        return;
      }
    });

    return v;
  };

  const reset = (): void => {
    form.value.resetValidation();
    state.advanced = false;
  };

  defineExpose({
    validate,
    reset,
  });
</script>

<style lang="scss" scoped>
  .v-list--three-line .v-list-item,
  .v-list-item--three-line {
    min-height: 48px;
  }
</style>
