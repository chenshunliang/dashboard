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
  <div :style="{ overflowY: 'auto', maxHeight: `calc((100vh - 352px) / ${store.state.Scale})` }">
    <v-card v-if="visualConfigItems.length > 0">
      <div class="pt-3 px-4 text-subtitle-2 primary--text">{{ isTensor ? 'TensorBoard' : 'Ray' }}</div>
      <v-simple-table class="mx-2 pa-2 pb-3">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">{{ i18nLocal.t('table.visual_name') }}</th>
              <th v-if="isTensor" class="text-left" width="350px">{{ i18nLocal.t('table.visual_log') }}</th>
              <th class="text-left">{{ i18nLocal.t('table.visual_status') }}</th>
              <th class="text-left">{{ i18nLocal.t('table.visual_url') }}</th>
              <th class="text-left">{{ i18nLocal.t('table.update_at') }}</th>
              <th width="50px" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in visualConfigItems" :key="index">
              <td>{{ item.name }} </td>
              <td v-if="isTensor">{{ item.tensorboard ? item.tensorboard.logdir : '-' }} </td>
              <td>
                <BaseStatus
                  v-if="getStatus(item) === 'ready'"
                  :bg-color="POD_STATUS_COLOR['Running']"
                  :status="getStatus(item)"
                />
                <VisualStatusTip v-else :visual="item">
                  <template #trigger>
                    <BaseStatus
                      :bg-color="
                        POD_STATUS_COLOR[item.paused ? 'Success' : getStatus(item) === 'failed' ? 'Error' : 'Pending']
                      "
                      :flashing="!item.paused && getStatus(item) !== 'failed'"
                      :status="getStatus(item)"
                    />
                    <div class="text-caption status pl-5">
                      {{
                        item.status && item.status.message && item.status.message.length > 50
                          ? `${item.status.message.substr(0, 50)} ...`
                          : item.status.message || '-'
                      }}
                    </div>
                  </template>
                </VisualStatusTip>
              </td>
              <td>
                <div v-if="item.status.tensorboard && item.status.tensorboard.host">
                  <div class="float-left">
                    <BaseLogo
                      class="mr-2"
                      :color="store.state.ThemeColor"
                      default-logo="none"
                      icon-name="tensorflow"
                      :ml="0"
                      :mt="1"
                      :width="20"
                    />
                  </div>
                  <div class="float-left">
                    {{ item.status.tensorboard ? item.status.tensorboard.host : item.status.host }}
                    <v-btn
                      color="primary"
                      icon
                      small
                      @click="toBoard(item.status.tensorboard ? item.status.tensorboard.host : item.status.host)"
                    >
                      <v-icon small>mdi-open-in-new</v-icon>
                    </v-btn>
                  </div>
                  <div class="kubegems__clear-float" />
                </div>
                <template v-if="item.portExposure && item.portExposure.ports && item.portExposure.ports.length > 0">
                  <div
                    v-for="(port, idx) in item.status.portExposure ? item.status.portExposure.portStates || [] : []"
                    :key="idx"
                  >
                    <div class="float-left">
                      <BaseLogo
                        class="mr-2"
                        :color="store.state.ThemeColor"
                        default-logo="none"
                        icon-name="ray"
                        :ml="0"
                        :mt="1"
                        :width="20"
                      />
                    </div>
                    <div class="float-left">
                      {{ port.url }}
                      <v-btn color="primary" icon small @click="toBoard(port.url)">
                        <v-icon small>mdi-open-in-new</v-icon>
                      </v-btn>
                    </div>
                    <div class="kubegems__clear-float" />
                  </div>
                </template>
              </td>
              <td> {{ moment(item.updatedAt || item.createdAt).format('lll') }}</td>
              <td>
                <v-flex :id="`r-visual${index}`" />
                <v-menu :attach="`#r-visual${index}`" left top>
                  <template #activator="{ on }">
                    <v-btn icon>
                      <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-text class="pa-2">
                      <v-flex v-if="item.paused">
                        <v-btn color="primary" small text @click="updateVisualConfigPaused(item, false)">
                          {{ i18nLocal.t('operate.start') }}
                        </v-btn>
                      </v-flex>
                      <v-flex v-else>
                        <v-btn color="warning" small text @click="updateVisualConfigPaused(item, true)">
                          {{ i18nLocal.t('operate.stop') }}
                        </v-btn>
                      </v-flex>

                      <v-flex>
                        <v-btn color="primary" small text @click="updateVisualConfig(item)">
                          {{ i18n.t('operate.edit') }}
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-btn color="error" small text @click="removeVisualConfig(item)">
                          {{ i18n.t('operate.delete') }}
                        </v-btn>
                      </v-flex>
                    </v-card-text>
                  </v-card>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <v-hover #default="{ hover }">
      <v-card
        :class="{ 'kubegems__full-height': true, kubegems__pointer: true, 'mt-3': visualConfigItems.length > 0 }"
        :elevation="hover ? 5 : 0"
        flat
        min-height="40"
        @click="addVisualConfig"
      >
        <v-card-text class="pa-0 kubegems__full-height">
          <v-list-item class="kubegems__full-height" three-line>
            <v-list-item-content>
              <div block class="text-h6 primary--text text-center">
                <v-icon class="mt-n1" color="primary">mdi-plus-box</v-icon>
                {{ i18nLocal.t('operate.add_visual') }}
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-card-text>
      </v-card>
    </v-hover>

    <VisualConfigForm ref="visualForm" @refresh="getVisualConfigList" />
  </div>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { POD_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import { deepCopy, sleep } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { computed, onUnmounted, reactive, ref, watch } from 'vue';
  import { useRequest } from 'vue-request';

  import { Job } from '../../../../api/job';
  import { VisualConfig } from '../../../../api/visualconfig';
  import { useI18n } from '../../i18n';
  import VisualConfigForm from './VisualConfigForm.vue';
  import VisualStatusTip from './VisualStatusTip.vue';

  const props = withDefaults(
    defineProps<{
      job?: Job;
    }>(),
    {
      job: void 0,
    },
  );

  const store = useStore();
  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const state = reactive({
    process: true,
  });
  const visualConfigItems = ref<VisualConfig[]>([]);
  const getVisualConfigList = async () => {
    const data = await new VisualConfig({
      name: props.job.name,
      tenant: store.getters.Tenant().TenantName,
      region: store.getters.Region().RegionName,
    }).getVisualConfig({ noprocessing: !state.process });
    if (data && data?.name) visualConfigItems.value = [data];
  };

  const isTensor = computed(() => {
    const [item] = visualConfigItems.value;
    if (item) {
      return !(item?.portExposure?.ports?.length > 0);
    }
    return true;
  });

  const toBoard = (url: string): void => {
    window.open(url);
  };

  const visualForm = ref(null);
  const updateVisualConfig = (item: VisualConfig): void => {
    visualForm.value.init(item);
    visualForm.value.open(props.job);
  };

  const addVisualConfig = (): void => {
    visualForm.value.open(props.job);
  };

  const removeVisualConfig = (item: VisualConfig): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18nLocal.t('tip.visual_instance')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18nLocal.t('tip.visual_instance')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new VisualConfig({
            ...param.item,
            tenant: store.getters.Tenant().TenantName,
            region: store.getters.Region().RegionName,
          }).deleteVisualConfig();
          await sleep(500);
          getVisualConfigList();
        }
      },
    });
  };

  const updateVisualConfigPaused = (item: VisualConfig, paused = false): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t(paused ? 'operate.stop_c' : 'operate.start_c', [i18nLocal.t('tip.visual_instance')]),
      content: {
        text: `${i18n.t(paused ? 'operate.stop_c' : 'operate.start_c', [i18nLocal.t('tip.visual_instance')])} ${
          item.name
        }`,
        type: 'confirm',
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          const data = deepCopy(param.item);
          data.paused = paused;
          console.log(data);
          console.log(
            new VisualConfig({
              ...data,
              tenant: store.getters.Tenant().TenantName,
              region: store.getters.Region().RegionName,
            }),
          );
          await new VisualConfig({
            ...data,
            tenant: store.getters.Tenant().TenantName,
            region: store.getters.Region().RegionName,
          }).updateVisualConfig();
          await sleep(500);
          getVisualConfigList();
        }
      },
    });
  };

  type cancelHandle = () => void;
  let _cancel: cancelHandle = void 0;
  watch(
    () => props.job,
    (newValue) => {
      if (newValue && newValue.name) {
        if (_cancel) _cancel();
        const { cancel } = useRequest(getVisualConfigList, {
          pollingInterval: 1000 * 30,
          onSuccess: () => {
            state.process = false;
          },
        });
        _cancel = cancel;
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
  onUnmounted(() => {
    if (_cancel) _cancel();
  });

  const getStatus = (item: VisualConfig): string => {
    return item.status?.status || item.status?.status || 'Unknown';
  };
</script>

<style lang="scss" scoped>
  .status {
    color: grey;
  }
</style>
