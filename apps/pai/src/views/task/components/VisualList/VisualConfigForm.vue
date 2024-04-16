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
    icon="mdi-chart-ppf"
    :title="i18nLocal.t('operate.visual')"
    :width="700"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <v-row class="mt-0">
          <v-col v-for="(item, index) in dashItems" :key="index" class="pt-0" cols="6">
            <v-hover #default="{ hover }">
              <v-card
                class="kubegems__pointer view view__pos"
                :elevation="hover ? 2 : 0"
                flat
                @click.stop="setDashType(item.value)"
              >
                <v-list-item three-line>
                  <v-list-item-content>
                    <v-list-item-title class="text-body-2 kubegems__pointer">
                      <div class="float-left">
                        <BaseLogo
                          class="mr-2"
                          :color="store.state.ThemeColor"
                          default-logo="none"
                          :icon-name="item.icon"
                          :ml="0"
                          :mt="0"
                          :width="24"
                        />
                      </div>
                      <div class="float-left view__type">
                        {{ item.text }}
                      </div>
                      <div class="kubegems__clear-float" />
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <span class="text-body-2"> {{ item.desc }} </span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <template v-if="dashType === item.value">
                  <v-flex class="view__watermark-bg" />
                  <v-flex class="view__watermark font-weight-medium">
                    {{ i18nLocal.t('tip.now_select') }}
                  </v-flex>
                </template>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
        <BaseSubTitle class="mt-2" :title="i18n.t('form.definition', [i18nLocal.t('operate.visual')])" />
        <v-card-text class="pa-2">
          <template v-if="dashType === 'log'">
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-model="mountVolume"
                  color="primary"
                  :items="mountItems"
                  :label="i18nLocal.t('tip.volume')"
                  :no-data-text="i18n.t('data.no_data')"
                  @change="mountVolumeChanged"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small>
                      {{ item.text }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-if="obj.tensorboard"
                  v-model.trim="obj.tensorboard.logdir"
                  :label="i18nLocal.t('tip.logdir')"
                  required
                  :rules="objRules.logdir"
                />
              </v-col>
            </v-row>
          </template>
          <template v-else-if="dashType === 'port'">
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-if="obj.portExposure"
                  v-model="obj.portExposure.selector"
                  color="primary"
                  item-text="pai.kubegems.io/role-name"
                  :items="roleItems"
                  :label="i18nLocal.t('tip.job_role')"
                  :no-data-text="i18n.t('data.no_data')"
                  return-object
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small>
                      {{ item['pai.kubegems.io/role-name'] }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-if="obj.portExposure"
                  v-model="obj.portExposure.ports"
                  color="primary"
                  :items="portItems"
                  :label="i18nLocal.t('tip.port')"
                  multiple
                  :no-data-text="i18n.t('data.no_data')"
                  return-object
                  :rules="objRules.ports"
                  :search-input.sync="portText"
                  @keyup.enter="createPort"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small>
                      {{ item.text }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </template>
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
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref } from 'vue';

  import { Job } from '../../../../api/job';
  import { VisualConfig } from '../../../../api/visualconfig';
  import { useI18n } from '../../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
  });

  const dashType = ref('log');
  const dashItems = [
    { text: 'TensorBoard', desc: i18nLocal.t('tip.from_log'), value: 'log', icon: 'tensorflow' },
    { text: 'Ray Dashboard', desc: i18nLocal.t('tip.from_port'), value: 'port', icon: 'ray' },
  ];
  const setDashType = (type: string) => {
    dashType.value = type;
  };

  const obj = ref<VisualConfig>(
    new VisualConfig({
      tensorboard: { logdir: '', pvc: { mountPath: '', name: '' } },
      portExposure: { selector: void 0, ports: [] },
    }),
  );
  const objRules = {
    logdir: [required],
    ports: [required],
  };

  const roleItems = ref([]);
  const open = async (job?: Job): Promise<void> => {
    await getMountList(job);
    if (!state.edit) {
      obj.value.job = job.name;
      obj.value.name = job.name;
    }
    job.config.roles.forEach((item) => {
      roleItems.value.push({
        'pai.kubegems.io/job-name': `${job.tenant}-${job.name}`,
        'pai.kubegems.io/role-name': item.name,
      });
    });
    state.dialog = true;
  };
  const init = async (item: VisualConfig): Promise<void> => {
    state.edit = true;
    obj.value = await new VisualConfig({
      ...item,
      tenant: store.getters.Tenant().TenantName,
      region: store.getters.Region().RegionName,
    }).getVisualConfig();
    mountVolume.value = obj.value.name;
    if (obj.value.portExposure?.ports?.length > 0) {
      portItems.value = obj.value.portExposure.ports.map((item) => ({
        text: item.port,
        value: { name: `port-${item.port}`, port: item.port },
      }));
      dashType.value = 'port';
    }
  };
  defineExpose({
    open,
    init,
  });

  const portItems = ref([]);
  const portText = ref('');
  const createPort = () => {
    if (!new RegExp('^\\d*$').test(portText.value.trim())) {
      store.commit('SET_SNACKBAR', {
        text: i18nLocal.t('tip.error_port'),
        color: 'warning',
      });
      return;
    }
    if (
      !portItems.value.some((p) => {
        return p.value.port.toString() === portText.value.trim();
      })
    ) {
      portItems.value.push({
        text: portText.value.trim(),
        value: { port: parseInt(portText.value.trim()) },
      });
      obj.value.portExposure.ports.push({ port: parseInt(portText.value.trim()) });
      portText.value = '';
    }
  };

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      obj.value.tenant = store.getters.Tenant().TenantName;
      obj.value.region = store.getters.Region().RegionName;
      if (dashType.value === 'log') {
        obj.value.portExposure = null;
      } else if (dashType.value === 'port') {
        obj.value.tensorboard = null;
      }
      if (state.edit) {
        await new VisualConfig(obj.value).updateVisualConfig();
      } else {
        await new VisualConfig(obj.value).addVisualConfig();
      }
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.resetValidation();
    state.edit = false;
    obj.value = new VisualConfig();
    mountVolume.value = '';
    dashType.value = 'log';
  };

  const mountItems = ref([]);
  const getMountList = async (job: Job): Promise<void> => {
    const data = await new Job(job).getMountListInJob();
    const [role] = data.roles;
    if (role && role.mounts) {
      mountItems.value = role.mounts.map((item) => ({
        text: item.fullName,
        value: item.name,
        obj: item,
      }));
    }
  };

  const mountVolume = ref<string>('');
  const mountVolumeChanged = (): void => {
    const _item = mountItems.value.find((m) => {
      return m.value === mountVolume.value;
    });
    if (_item) {
      obj.value.tensorboard.pvc = {
        name: _item.obj.fullName,
        mountPath: _item.obj.targetPath,
      };
    }
  };
</script>

<style lang="scss" scoped>
  .view {
    border: 2px solid var(--primary-color);

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 100px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: var(--primary-color);
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 10px;
      right: -3px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }

    &__type {
      line-height: 24px;
    }
  }
</style>

<style scoped>
  .v-list--three-line .v-list-item,
  .v-list-item--three-line {
    min-height: 78px !important;
  }
</style>
