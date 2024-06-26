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
  <v-menu
    v-if="store.state.Admin"
    content-class="kubegems__tool-card-menu"
    left
    min-width="350px"
    offset-y
    origin="bottom right"
    top
    transition="scale-transition"
  >
    <template #activator="{ on, attrs }">
      <v-btn bottom v-bind="attrs" class="tool__btn" color="primary" dark fab fixed right small v-on="on">
        <v-icon>mdi-wrench</v-icon>
      </v-btn>
    </template>
    <v-card class="pa-0" flat>
      <BaseSubTitle :divider="false" :title="i18nLocal.t('tip.tool_box')" />
      <v-card-text class="px-2 pt-0 pb-2">
        <v-card v-if="store.state.Admin" class="my-2 pa-2" flat hover outlined @click="toAdminViewport">
          <v-card-text class="pa-1">
            <v-flex class="float-left">
              <v-icon color="primary" left> mdi-cog </v-icon>
            </v-flex>
            <v-flex class="text-subtitle-2 primary--text">{{ smallTitle }} </v-flex>
            <v-flex class="text-caption"> {{ i18nLocal.t('tip.management_desc') }} </v-flex>
            <div class="kubegems__clear-float" />
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useRouter } from '@kubegems/extension/proxy';
  import { useParams, useQuery, useMeta } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { computed } from 'vue';

  import { useI18n } from './i18n';

  const store = useStore();
  const i18nLocal = useI18n();
  const router = useRouter();
  const routeParams = useParams();
  const query = useQuery();
  const meta = useMeta();

  const smallTitle = computed(() => {
    if (
      ['workspace', 'project', 'dashboard', 'admin-workspace', 'app-store', 'model-store'].indexOf(
        meta.value.rootName,
      ) > -1
    ) {
      return config.product.KUBEGEMS + i18nLocal.t('tip.cluster_manage');
    } else if (['observe', 'admin-observe'].indexOf(meta.value.rootName) > -1) {
      return config.product.OBSERVEGEMS + i18nLocal.t('tip.management');
    } else if (['modelhub', 'admin-modelhub'].indexOf(meta.value.rootName) > -1) {
      return config.product.MODELHUB + i18nLocal.t('tip.management');
    }
    return i18nLocal.t('tip.management');
  });

  const toAdminViewport = async (): Promise<void> => {
    store.commit('CLEAR_VIRTUAL_SPACE');
    store.commit('CLEAR_PLUGINS_INTERVAL');
    if (store.getters.Cluster().ID === 0) {
      await store.dispatch('UPDATE_CLUSTER_DATA');
    }
    store.commit('SET_EDGE', '');
    if (['workspace', 'project', 'dashboard', 'app-store', 'model-store'].indexOf(meta.value.rootName) > -1) {
      await router.push({
        name: 'admin-workspace',
        params: { cluster: store.getters.Cluster().ClusterName },
        query: query.value,
      });
    } else if (['observe'].indexOf(meta.value.rootName) > -1) {
      await router.push({ name: 'admin-observe' });
    }
    store.commit('SET_ADMIN_VIEWPORT', true);
  };
</script>

<style lang="scss" scoped>
  .tool {
    &__btn {
      bottom: 20px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }
  }
</style>
