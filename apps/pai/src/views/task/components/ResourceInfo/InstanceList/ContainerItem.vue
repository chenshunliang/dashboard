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
  <v-flex>
    <span>{{ i18n.t('resource.container') }}</span>
    <v-sheet v-if="containerItems.length === 0" class="grey lighten-4 rounded my-1 py-6 text-center">
      {{ i18n.t('data.no_data') }}
    </v-sheet>
    <v-sheet v-for="(container, index) in containerItems" :key="index" class="grey lighten-4 rounded my-1">
      <v-list-item two-line>
        <v-list-item-content class="py-0">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `515px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <v-icon v-if="container.init" class="float-left icon__pod" color="primary" left small>
                    mdi-alpha-i-circle
                  </v-icon>
                  <v-icon v-else class="float-left icon__pod" color="primary" left small> mdi-alpha-c-circle </v-icon>
                  <v-flex class="float-left">
                    {{ container.name }}
                  </v-flex>
                  <div class="kubegems__clear-float" />
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ container.image }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <span
                    :class="`v-avatar mr-2 ${
                      getContainerStatus(container) === 'Waiting' ? 'kubegems__waiting-flashing' : ''
                    }`"
                    :style="{
                      height: '10px',
                      minWidth: '10px',
                      width: '10px',
                      backgroundColor: `${CONTAINER_STATUS_COLOR[getContainerStatus(container)]}`,
                    }"
                  />
                  <span v-if="container.state.running"> Running </span>
                  <span v-else-if="container.state.terminated">
                    Terminated({{ container.state.terminated.reason }})
                  </span>
                  <span v-else-if="container.state.waiting"> Waiting({{ container.state.waiting.reason }}) </span>
                  <span v-else> -- </span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ i18nLocal.t('table.status') }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `200px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <v-flex
                    v-for="(probe, index) in getContainerProbes(pod, container)"
                    :key="index"
                    class="float-left mr-2"
                  >
                    <ProbeTip :item="probe.probe" :title="probe.title" />
                  </v-flex>
                  <v-flex v-if="getContainerProbes(pod, container).length === 0" class="float-left mr-1">
                    {{ i18n.t('data.no_data') }}
                  </v-flex>
                  <div class="kubegems__clear-float" />
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> {{ i18nLocal.t('tip.probe') }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{ container.restartCount }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ i18nLocal.t('tip.restart_count') }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  <span v-if="container.state.running">
                    {{
                      container.state.running.startedAt
                        ? moment(container.state.running.startedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                        : ''
                    }}
                  </span>
                  <span v-else-if="container.state.terminated">
                    {{
                      container.state.terminated.startedAt
                        ? moment(container.state.terminated.startedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                        : i18n.t('data.unknown')
                    }}
                  </span>
                  <span v-else>{{ i18n.t('data.no_data') }}</span>
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> Age </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{
                    container.resources && container.resources.limits
                      ? container.resources.limits.cpu
                      : i18nLocal.t('tip.no_limit')
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> limits.cpu </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `150px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1 kubegems__text font-weight-regular">
                  {{
                    container.resources && container.resources.limits
                      ? container.resources.limits.memory
                      : i18nLocal.t('tip.no_limit')
                  }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> limits.memory </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
      </v-list-item>
    </v-sheet>
  </v-flex>
</template>

<script lang="ts" setup>
  import { Pod } from '@kubegems/api/typed/pod';
  import ProbeTip from '@kubegems/components/logicComponents/ProbeTip.vue';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { CONTAINER_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { ref, watch } from 'vue';

  import { useI18n } from '../../../i18n';

  const props = withDefaults(
    defineProps<{
      pod?: Pod;
    }>(),
    {
      pod: void 0,
    },
  );

  const containerItems = ref([]);
  watch(
    () => props.pod,
    (newValue, oldValue) => {
      if (newValue?.metadata?.name !== oldValue?.metadata?.name) {
        containerItems.value = [];
        const _containerStatusItems = deepCopy(newValue.status.containerStatuses);
        newValue.spec.containers.forEach((c) => {
          const index = _containerStatusItems.findIndex((s) => {
            return s.name === c.name;
          });
          if (index > -1) {
            const container = _containerStatusItems[index];
            container.image = c.image;
            container.resources = c.resources;
            _containerStatusItems[index] = container;
          }
        });

        containerItems.value = containerItems.value.concat(_containerStatusItems);

        if (newValue.status?.initContainerStatuses?.length > 0) {
          const _initContainerStatusItems = deepCopy(newValue.status.initContainerStatuses);
          newValue.spec.initContainers.forEach((c) => {
            const index = _initContainerStatusItems.findIndex((s) => {
              return s.name === c.name;
            });
            if (index > -1) {
              const container = _initContainerStatusItems[index];
              container.image = c.image;
              container.resources = c.resources;
              container.init = true;
              _initContainerStatusItems[index] = container;
            }
          });

          containerItems.value = containerItems.value.concat(_initContainerStatusItems);
          containerItems.value = containerItems.value.slice();
        }
      }
    },
    { immediate: true, deep: true },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const getContainerStatus = (item: any) => {
    if (item.state) {
      if (item.state.running) return 'Running';
      if (item.state.terminated) return 'Terminated';
      if (item.state.waiting) return 'Waiting';
      else return 'Unknown';
    } else return 'Failed';
  };

  const getContainerProbes = (item: any, container: any) => {
    const probes = [];
    let spec = undefined;
    if (container.init) {
      spec = item.spec.initContainers.find((c) => {
        return (c.name = container.name);
      });
    } else {
      spec = item.spec.containers.find((c) => {
        return (c.name = container.name);
      });
    }
    if (spec) {
      if (spec.livenessProbe) {
        probes.push({ title: i18nLocal.t('tip.live_probe'), probe: spec.livenessProbe });
      }
      if (spec.readinessProbe) {
        probes.push({ title: i18nLocal.t('tip.read_probe'), probe: spec.readinessProbe });
      }
      if (spec.startupProbe) {
        probes.push({ title: i18nLocal.t('tip.start_probe'), probe: spec.startupProbe });
      }
    }
    return probes;
  };
</script>

<style lang="scss" scoped>
  .icon {
    &__pod {
      font-size: 18px !important;
    }
  }
</style>
