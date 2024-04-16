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
    <BaseSubTitle :title="i18nLocal.t('tip.task_conf')">
      <template #action>
        <v-btn color="primary" small text @click="switchMode">
          <v-icon small>mdi-swap-horizontal</v-icon>
          {{ mode === 0 ? i18nLocal.t('operate.multi') : i18nLocal.t('operate.single') }}
        </v-btn>
      </template>
    </BaseSubTitle>

    <v-tabs v-model="tab" class="px-2 rounded-t mt-2 mb-3" height="28" @change="tabChanged">
      <v-tab v-for="(item, index) in tabItems" :key="item.value">
        {{ item.text }}
        <v-icon v-if="index > 0" right small @click="removeRole(index)">mdi-close-circle</v-icon>
      </v-tab>

      <v-btn v-if="mode === 1" class="ml-2" color="primary" depressed icon small @click="copyFromJob">
        <v-icon>mdi-plus-circle</v-icon>
      </v-btn>

      <v-spacer />

      <div v-if="mode === 1" class="float-right mr-2">
        <v-switch v-model="obj.config.rdmaEnabled" hide-details :label="i18nLocal.t('tip.enable_rdma')" small />
      </div>
    </v-tabs>
    <v-divider class="mx-2" />

    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.roles[tab].name"
            :label="i18nLocal.t('tip.role_name')"
            required
            :rules="roleItemsRules[tab].name"
            @input="inputName"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="obj.config.roles[tab].replicas"
            :label="i18nLocal.t('tip.replicas')"
            required
            :rules="roleItemsRules[tab].replicas"
            type="number"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.spec')" />
    <v-card-text class="pa-2">
      <SpecTable v-model="obj.config.roles[tab].sku" :job="job" />
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.image_conf')" />
    <v-card-text class="pa-2">
      <ImageConf v-model="obj.config.roles[tab].image" :edit="edit" for="training" @overlay="changeOverlayState" />
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.data_conf')" />
    <v-card-text class="pa-2">
      <SetMount v-model="obj.config.roles[tab].volumeMountSets" @overlay="changeOverlayState" />
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.env')" />
    <v-card-text class="pa-2">
      <v-row class="mt-0">
        <v-col cols="12">
          <Env v-model="obj.config.roles[tab].env" @overlay="changeOverlayState" />
        </v-col>
      </v-row>
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.command')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col cols="12">
          <Command v-model="obj.config.roles[tab].command" @overlay="changeOverlayState" />
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
            v-model="obj.config.roles[tab].shmSize"
            :label="i18nLocal.t('tip.shmSize')"
            required
            :rules="roleItemsRules[tab].shmSize"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.roles[tab].workingDir"
            :label="i18nLocal.t('tip.working_dir')"
            required
            :rules="roleItemsRules[tab].workingDir"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref, watch } from 'vue';

  import { Job, Role } from '../../../../api/job';
  import Command from '../../../components/Command.vue';
  import Env from '../../../components/Env.vue';
  import ImageConf from '../../../components/ImageConf.vue';
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

  const tab = ref(0);
  const tabItems = ref([{ text: 'master', value: 'master' }]);

  const tabChanged = () => {
    const role = obj.value.config.roles?.[tab.value];
    state.advanced = Boolean(parseFloat(role?.shmSize) || role?.workingDir);
  };

  const mode = ref(0);
  const switchMode = async () => {
    if (mode.value === 0) {
      mode.value = 1;
      obj.value.config.roles[0].name = 'master';
    } else {
      mode.value = 0;
      tab.value = 0;
      tabItems.value = [tabItems.value[0]];
      roleItemsRules.value = [roleItemsRules.value[0]];
      obj.value.config.roles = [obj.value.config.roles[0]];
      obj.value.config.roles[0].name = 'job';
      obj.value.config.rdmaEnabled = false;
    }
    tabItems.value[0].text = obj.value.config.roles[0].name;
  };

  const obj = ref(props.job);
  const roleRule = {
    name: [required],
    replicas: [required],
    framework: [required],
    shmSize: [(v) => !!new RegExp('(^\\d+[K|M|G|T]i$)|(^0$)').test(v) || i18nLocal.t('tip.storage_rule')],
    workingDir: [],
  };
  const roleItemsRules = ref([roleRule]);

  watch(
    () => obj.value.config.roles.length,
    (newValue) => {
      if (newValue) {
        tabItems.value = obj.value.config.roles.map((r) => {
          return { text: r.name, value: r.name };
        });
        roleItemsRules.value = obj.value.config.roles.map(() => {
          return roleRule;
        });

        if (newValue > 1) mode.value = 1;
        else mode.value = 0;
        tabChanged();
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const inputName = (): void => {
    tabItems.value[tab.value] = {
      text: obj.value.config.roles[tab.value].name,
      value: obj.value.config.roles[tab.value].name,
    };
  };

  const form = ref(null);
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

  const copyFromJob = (): void => {
    obj.value.config.roles.push(new Role(deepCopy(obj.value.config.roles[0])));
    obj.value.config.roles[obj.value.config.roles.length - 1].name = `worker${obj.value.config.roles.length - 1}`;
    roleItemsRules.value.push(deepCopy(roleRule));
    tabItems.value.push({
      text: `worker${obj.value.config.roles.length - 1}`,
      value: `worker${obj.value.config.roles.length - 1}`,
    });
  };

  const removeRole = (index: number): void => {
    if (index === tab.value) tab.value = 0;
    obj.value.config.roles.splice(index, 1);
    tabItems.value.splice(index, 1);
    roleItemsRules.value.splice(index, 1);
  };
</script>

<style lang="scss" scoped>
  .v-list--three-line .v-list-item,
  .v-list-item--three-line {
    min-height: 48px;
  }
</style>
