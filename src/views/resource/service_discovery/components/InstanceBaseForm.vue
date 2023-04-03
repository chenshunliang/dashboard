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
    :title="i18n.t('operate.update_c', [i18n.t('resource.instance')])"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.instance')])" />
      <v-card-text class="pa-2 mt-2">
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="obj.ip"
                class="my-0"
                :label="i18nLocal.t('form.ip')"
                readonly
                required
                :rules="objRules.ip"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="obj.port"
                class="my-0"
                :label="i18nLocal.t('form.port')"
                readonly
                required
                :rules="objRules.port"
                type="number"
              />
            </v-col>
            <!-- <v-col cols="6">
              <v-text-field
                v-model="obj.serviceName"
                class="my-0"
                :label="i18nLocal.t('form.service_name')"
                required
                :rules="objRules.serviceName"
              />
            </v-col> -->
            <v-col cols="6">
              <v-text-field
                v-model="obj.weight"
                class="my-0"
                :label="i18nLocal.t('form.weight')"
                required
                :rules="objRules.weight"
                type="number"
              />
            </v-col>
            <v-col cols="6">
              <v-switch v-if="obj.enabled" class="mt-5" :label="i18nLocal.t('form.enabled')" />
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
  import { ServiceInstance } from '@/types/nacos';
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

  const obj = ref<ServiceInstance>(new ServiceInstance());
  const objRules = {
    ip: [required],
    port: [required],
    serviceName: [required],
    weight: [required],
  };

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      await new ServiceInstance(obj).updateInstance(
        store.getters.Tenant().TenantName,
        store.getters.Project().ProjectName,
        store.getters.Environment().EnvironmentName,
      );
      reset();
      emit('refresh');
    }
  };

  const init = (item: ServiceInstance): void => {
    state.edit = true;
    obj.value = new ServiceInstance(item);
  };

  const reset = (): void => {
    state.dialog = false;
    state.edit = false;
    form.value.reset();
    obj.value = new ServiceInstance();
  };

  defineExpose({
    open,
    init,
  });
</script>
