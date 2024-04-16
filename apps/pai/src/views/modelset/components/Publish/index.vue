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
    icon="mdi-publish"
    :title="i18nLocal.t('operate.publish_c', [i18nLocal.t('resource.model')])"
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <component :is="components[state.step]" ref="form" :task="obj" />
    </template>
    <template #action>
      <v-btn
        v-if="state.step === 2"
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

  import { Modelset, PublishInfo } from '../../../../api/modelset';
  import { AsyncTask } from '../../../../api/task';
  import { useI18n } from '../../i18n';
  import BaseInfo from './BaseInfo.vue';
  import Registry from './Registry.vue';
  import Resource from './Resource.vue';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    step: 0,
    totalStep: 3,
  });

  let components = ref([BaseInfo, Resource, Registry]);

  const obj = ref<AsyncTask>(new AsyncTask());

  const open = (): void => {
    state.dialog = true;
  };
  const init = (item: Modelset): void => {
    obj.value.config.extraInfo = new PublishInfo();
    obj.value.config.url = '';
    obj.value.config.token = '';
    obj.value.config.action = 'push';
    obj.value.kind = 'ModelX';
    obj.value.storageSetName = item.name;
    obj.value.name = item.name;
    obj.value.storageSetKind = 'modelset';
    obj.value.tenant = item.tenant;
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      obj.value.config.extraInfo = JSON.stringify(obj.value.config.extraInfo);
      await new AsyncTask({ ...obj.value, region: store.getters.Region().RegionName }).addTask();
      reset();
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
    form.value.reset();
  };
</script>
