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
    icon="mdi-developer-board"
    :title="
      state.edit
        ? i18n.t('operate.update_c', [i18nLocal.t('resource.instance')])
        : i18n.t('operate.create_c', [i18nLocal.t('resource.instance')])
    "
    :width="1200"
    @reset="reset"
  >
    <template #content>
      <component :is="components[state.step]" ref="form" :edit="state.edit" :job="obj" />
    </template>
    <template #action>
      <v-btn
        v-if="state.step === 2 || state.totalStep === 1"
        class="float-right mx-2"
        color="primary"
        :loading="store.state.Circular"
        text
        @click="confirm"
      >
        {{ i18n.t('operate.confirm') }}
      </v-btn>
      <v-btn
        v-if="state.step >= 0 && state.step < state.totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="next"
      >
        {{ i18n.t('operate.next') }}
      </v-btn>
      <v-btn
        v-if="state.step > 0 && state.step <= state.totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="previous"
      >
        {{ i18n.t('operate.previous') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { Job } from '../../../../api/job';
  import Confirm from '../../../components/Confirm.vue';
  import { useI18n } from '../../i18n';
  import BaseInfo from './BaseInfo.vue';
  import InstanceConf from './InstanceConf.vue';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    step: 0,
    totalStep: 3,
    edit: false,
    otherVolumeMount: {},
  });

  let components = ref([BaseInfo, InstanceConf, Confirm]);

  const obj = ref<Job>(new Job());

  const open = (): void => {
    state.dialog = true;
  };
  const init = async (item: Job): Promise<void> => {
    state.edit = true;
    const data = await new Job(item).getJob();
    obj.value = data;
    if (data.config.paused) {
      data.config.roles.forEach((d, index) => {
        if (!d.env) d.env = [];
        if (!d.command) d.command = [];
        state.otherVolumeMount[index] = d.volumeMountSets.filter(
          (v) => ['modelset', 'codeset', 'dataset', 'workspace'].indexOf(v.kind) === -1,
        );
        d.volumeMountSets = d.volumeMountSets.filter(
          (v) => ['modelset', 'codeset', 'dataset', 'workspace'].indexOf(v.kind) > -1,
        );
      });
      components.value = [BaseInfo, InstanceConf, Confirm];
      state.totalStep = 3;
    } else {
      components.value = [BaseInfo];
      state.totalStep = 1;
    }
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate()) {
      obj.value.tenant = store.getters.Tenant().TenantName;
      obj.value.region = store.getters.Region().RegionName;
      obj.value.config.kind = 'modeling';
      if (state.edit) {
        await new Job(obj.value).updateJob();
      } else {
        await new Job(obj.value).addJob();
      }
      reset();
      emit('refresh');
    }
  };

  const next = async (): Promise<void> => {
    if (form.value.validate()) {
      state.step += 1;
    }
  };
  const previous = (): void => {
    state.step -= 1;
  };

  const reset = (): void => {
    state.dialog = false;
    state.step = 0;
    state.edit = false;
    form.value.reset();
    obj.value = new Job();
  };
</script>
