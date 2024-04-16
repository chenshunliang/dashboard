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
    icon="mdi-label"
    :title="i18nLocal.t('operate.label_compute')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('operate.label_compute')])" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="roles"
                color="primary"
                :items="labelItems"
                :label="i18nLocal.t('tip.role')"
                multiple
                :no-data-text="i18n.t('data.no_data')"
              >
                <template #selection="{ item }">
                  <v-chip close color="primary" small @click:close="removeLabel(item.value)">
                    {{ item.text }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>

        <div v-if="batchStatus">
          <BaseSubTitle :title="i18nLocal.t('table.status')" />
          <div
            v-for="(item, index) in batchSatusItems"
            :key="index"
            class="text-body-2 kubegems__text kubegems__break-all mx-2"
          >
            {{ item.name }}
            <v-icon v-if="item.success" color="success" right small> mdi-check-circle </v-icon>
            <v-icon v-else color="error" right small>mdi-close</v-icon>
          </div>
        </div>
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
  import { convertResponse2List } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { NodeSummary, Region } from '../../../api/region';
  import { useI18n } from '../i18n';

  const props = withDefaults(
    defineProps<{
      selectedItems?: NodeSummary[];
    }>(),
    {
      selectedItems: void 0,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  const roles = ref([]);
  const labelItems = [
    {
      text: i18nLocal.t('tip.compute'),
      value: 'pai.kubegems.io/node-role.compute',
    },
    {
      text: i18nLocal.t('tip.controller'),
      value: 'pai.kubegems.io/node-role.manager',
    },
    {
      text: i18nLocal.t('tip.app'),
      value: 'pai.kubegems.io/node-role.app',
    },
    {
      text: i18nLocal.t('tip.data'),
      value: 'pai.kubegems.io/node-role.storage',
    },
  ];

  const removeLabel = (label: string) => {
    roles.value.splice(roles.value.indexOf(label), 1);
  };

  const open = async (): Promise<void> => {
    state.dialog = true;
  };
  const region = ref(void 0);
  const batchStatus = ref(false);
  const batchItems = ref<Node[]>([]);
  const init = async (item: NodeSummary, reg: Region, batch = false): Promise<void> => {
    region.value = reg;
    batchStatus.value = batch;
    if (batch) {
      const data = await new Node().getNodeList(region.value.clusterName, { page: 1, size: 1000 });
      convertResponse2List(data).forEach((n) => {
        if (props.selectedItems?.findIndex((item) => item.name === n.metadata.name) > -1) {
          batchItems.value.push(n);
        }
      });
    } else {
      const data = await new Node({ metadata: { name: item.name } }).getNode(region.value.clusterName);
      batchItems.value = [data];
      roles.value =
        labelItems
          .map((item) => {
            if (data.metadata.labels?.[item.value] === 'true') return item.value;
          })
          .filter((item) => Boolean(item)) || [];
    }
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const batchSatusItems = ref([]);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      for (const index in batchItems.value) {
        const node = batchItems.value[index];
        try {
          roles.value.forEach((role) => {
            node.metadata.labels[role] = 'true';
          });
          labelItems.map((item) => {
            if (roles.value.indexOf(item.value) === -1) delete node.metadata.labels?.[item.value];
          });
          await new Node(node).metaNode(region.value.clusterName);
          batchSatusItems.value.push({ name: node.metadata.name, success: true });
        } catch (error) {
          batchSatusItems.value.push({ name: node.metadata.name, success: false });
        }
        batchSatusItems.value = batchSatusItems.value.slice();
      }
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.resetValidation();
    roles.value = [];
    batchSatusItems.value = [];
    batchItems.value = [];
  };
</script>
