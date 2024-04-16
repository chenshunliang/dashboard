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
    icon="mdi-import"
    :title="i18nLocal.t('operate.import_c', [i18n.t('resource.cluster')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="i18n.t('form.definition', [i18n.t('resource.cluster')])" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model.trim="obj.name"
                :label="i18nLocal.t('tip.name')"
                :readonly="state.edit"
                required
                :rules="objRules.name"
              />
            </v-col>
            <v-col cols="12">
              <v-autocomplete
                v-model="obj.clusterName"
                color="primary"
                :items="clusterItems"
                :label="i18nLocal.t('tip.cluster')"
                :no-data-text="i18n.t('data.no_data')"
                :readonly="state.edit"
                :rules="objRules.clusterName"
              >
                <template #selection="{ item }">
                  <v-chip color="primary" small>
                    {{ item.text }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="obj.description"
                auto-grow
                :label="i18nLocal.t('tip.desc')"
                required
                :rules="objRules.description"
              />
            </v-col>
            <v-col cols="12">
              <v-switch
                v-model="rdmaEnabeld"
                hide-details
                :label="i18nLocal.t('tip.rdma_enable')"
                @change="rdmaEnabeldChanged"
              />
            </v-col>
            <template v-if="rdmaEnabeld">
              <v-col cols="12">
                <v-text-field
                  v-model.trim="obj.rdmaNetworkAttachmentName"
                  :label="i18nLocal.t('tip.attach_name')"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.trim="obj.rdmaNetworkCIDR"
                  :label="i18nLocal.t('tip.cidr')"
                  required
                  :rules="objRules.cidr"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.trim="obj.rdmaNetworkDeviceName"
                  :label="i18nLocal.t('tip.device_name')"
                  required
                />
              </v-col>
            </template>
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
  import { useClusterList } from '@kubegems/api/hooks/cluster';
  import { Cluster } from '@kubegems/api/typed/cluster';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { name, required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { Region } from '../../../api/region';
  import { useI18n } from '../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
  });

  const obj = ref<Region>(new Region());
  const objRules = {
    name: [required, name],
    description: [],
    clusterName: [required],
    cidr: [
      (v) =>
        !v ||
        !!new RegExp(
          '^((\\d|[1-9]\\d|1\\d\\d|2([0-4]\\d|5[0-5]))\\.){3}((\\d|[1-9]\\d|1\\d\\d|2([0-4]\\d|5[0-5]))\\/){1}(\\d|[1-3]\\d)$',
        ).test(v) ||
        i18nLocal.t('ruler.cidr').toString(),
    ],
  };

  const clusterItems = ref<{ text: string; value: string }[]>([]);
  const open = async (): Promise<void> => {
    state.dialog = true;
    const data = await useClusterList(new Cluster());
    clusterItems.value = data.map((d) => {
      return { text: d.ClusterName, value: d.ClusterName };
    });
  };
  const init = async (item: Region): Promise<void> => {
    state.edit = true;
    obj.value = await new Region(item).getRegion();
    rdmaEnabeld.value =
      Boolean(obj.value.rdmaNetworkAttachmentName) &&
      Boolean(obj.value.rdmaNetworkCIDR) &&
      Boolean(obj.value.rdmaNetworkDeviceName);
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      await new Region(obj.value).addRegion();
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.resetValidation();
    state.edit = false;
    obj.value = new Region();
    rdmaEnabeld.value = false;
  };

  const rdmaEnabeld = ref(false);
  const rdmaEnabeldChanged = () => {
    if (!rdmaEnabeld.value) {
      obj.value.rdmaNetworkAttachmentName = '';
      obj.value.rdmaNetworkCIDR = '';
      obj.value.rdmaNetworkDeviceName = '';
    }
  };
</script>
