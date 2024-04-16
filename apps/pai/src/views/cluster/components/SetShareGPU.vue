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
    icon="mdi-arrow-split-vertical"
    :title="i18nLocal.t('operate.set_sgpu')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="i18nLocal.t('operate.set_sgpu')" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="12">
              <v-switch v-model="state.sgpu" class="mb-4" hide-details :label="i18nLocal.t('tip.enable_sgpu')" />
              <v-switch
                v-if="state.sgpu"
                v-model="state.advanced"
                class="mb-4"
                hide-details
                :label="i18nLocal.t('tip.advanced')"
              />
              <v-text-field
                v-if="state.sgpu && state.advanced"
                v-model="obj.count"
                :label="i18nLocal.t('tip.split_count')"
                required
                :rules="objRules.count"
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
  import { Node } from '@kubegems/api/typed/node';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { positiveInteger, required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { NodeSummary, Region } from '../../../api/region';
  import { useI18n } from '../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    sgpu: false,
    advanced: false,
  });

  const node = ref<Node>(void 0);
  const obj = ref({ count: 10 });
  const objRules = {
    count: [required, positiveInteger],
  };

  const open = async (): Promise<void> => {
    state.dialog = true;
  };
  const region = ref(void 0);
  const init = async (item: NodeSummary, reg: Region): Promise<void> => {
    region.value = reg;
    node.value = await new Node({ metadata: { name: item.name } }).getNode(region.value.clusterName);
    state.sgpu = node.value?.metadata?.labels?.['pai.kubegems.io/vgpu-enabled'] === 'true';
    if (node.value?.metadata?.labels?.['pai.kubegems.io/vgpu-per-card']) {
      state.advanced = true;
      obj.value.count = parseInt(node.value?.metadata?.labels?.['pai.kubegems.io/vgpu-per-card'] || '10');
    }
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      if (state.sgpu) {
        node.value.metadata.labels['pai.kubegems.io/vgpu-enabled'] = 'true';
        if (state.advanced) node.value.metadata.labels['pai.kubegems.io/vgpu-per-card'] = obj.value.count.toString();
      } else {
        delete node.value.metadata.labels['pai.kubegems.io/vgpu-enabled'];
        delete node.value.metadata.labels['pai.kubegems.io/vgpu-per-card'];
      }
      await new Node(node.value).metaNode(region.value.clusterName);
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.resetValidation();
    obj.value = { count: 10 };
    node.value = void 0;
    state.advanced = false;
    state.sgpu = false;
  };
</script>
