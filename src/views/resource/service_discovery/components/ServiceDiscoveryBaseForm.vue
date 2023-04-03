<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-search-web"
    :title="
      state.edit
        ? i18n.t('operate.update_c', [i18n.t('resource.service')])
        : i18n.t('operate.create_c', [i18n.t('resource.service')])
    "
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.service')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="obj.serviceName"
                class="my-0"
                :label="i18nLocal.t('form.service_name')"
                :readonly="state.edit"
                required
                :rules="objRules.serviceName"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="obj.protectThreshold"
                class="my-0"
                :label="i18nLocal.t('form.protect_threshold')"
                :readonly="state.edit"
                required
                :rules="objRules.protectThreshold"
                type="number"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="obj.groupName" class="my-0" :label="i18nLocal.t('form.group_name')" />
            </v-col>
            <v-col cols="12">
              <div class="pb-1" :style="{ fontSize: '13px' }">{{ i18nLocal.t('form.metadata') }}</div>
              <ACEEditor
                v-model="obj.metadata"
                :class="`rounded clear-zoom-${store.state.Scale.toString().replaceAll('.', '-')}`"
                lang="json"
                :options="{
                  tabSize: 2,
                  fontSize: 12,
                  printMarginColumn: 100,
                  showPrintMargin: false,
                  wrap: true,
                  readOnly: false,
                }"
                :style="{ height: `200px` }"
                @keydown.stop
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';

  import { useI18n } from '../i18n';
  import { useGlobalI18n } from '@/i18n';
  import { useStore } from '@/store';
  import { ServiceDiscovery } from '@/types/nacos';
  import { required } from '@/utils/rules';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
  });

  const open = (): void => {
    state.dialog = true;
  };

  const obj = ref<ServiceDiscovery>(new ServiceDiscovery());
  const objRules = {
    serviceName: [required],
    protectThreshold: [
      required,
      (v) => !v || (parseFloat(v) >= 0 && parseFloat(v) <= 1) || i18nLocal.t('ruler.float_0_1'),
    ],
  };

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      if (state.edit) {
        await new ServiceDiscovery(obj).updateService();
      } else {
        await new ServiceDiscovery(obj).addService();
      }
      reset();
      emit('refresh');
    }
  };

  const init = (item: ServiceDiscovery): void => {
    state.edit = true;
    obj.value = new ServiceDiscovery(item);
  };

  const reset = (): void => {
    state.dialog = false;
    state.edit = false;
    form.value.reset();
    obj.value = new ServiceDiscovery();
  };

  defineExpose({
    open,
    init,
  });
</script>
