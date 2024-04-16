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
  <v-container fluid>
    <BaseBreadcrumb />

    <v-row class="mt-3">
      <v-col v-for="(item, index) in regionItems" :key="index" class="pt-0" cols="3">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto" :elevation="hover ? 5 : 0" flat height="100%">
            <v-list-item three-line>
              <v-list-item-avatar class="primary--text" size="80" tile>
                <BaseLogo :icon-name="item.Vendor" :width="70" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a @click="toClusterDetail(item)">{{ item.name }}</a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="text-body-2"> {{ i18nLocal.t('tip.cluster_name') }} : </span>
                  {{ item.clusterName }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <span class="text-body-2"> {{ i18nLocal.t('tip.desc') }} : </span>
                  {{ item.description }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" small text @click="toClusterDetail(item)">
                {{ i18n.t('operate.detail') }}
              </v-btn>
              <v-btn color="primary" small text @click="editCluster(item)">
                {{ i18n.t('operate.edit') }}
              </v-btn>
              <v-btn color="error" small text @click="removeCluster(item)"> {{ i18n.t('operate.delete') }} </v-btn>
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
      <v-col class="pt-0" cols="3">
        <v-hover #default="{ hover }">
          <v-card
            class="kubegems__full-height kubegems__pointer"
            :elevation="hover ? 5 : 0"
            flat
            min-height="156"
            @click="importCluster"
          >
            <v-card-text class="pa-0 kubegems__full-height">
              <v-list-item class="kubegems__full-height" three-line>
                <v-list-item-content>
                  <div block class="text-h6 primary--text text-center">
                    <v-icon class="mt-n1" color="primary">mdi-download-box</v-icon>
                    {{ i18nLocal.t('operate.import_c', [i18n.t('resource.cluster')]) }}
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <ImportCluster ref="region" @refresh="getRegionList" />
  </v-container>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useParams, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import { onMounted, ref } from 'vue';

  import { Region } from '../../api/region';
  import ImportCluster from './components/ImportCluster.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();
  const router = useRouter();
  const routeParams = useParams();

  const regionItems = ref<Region[]>([]);
  const getRegionList = async (): Promise<void> => {
    const data = await new Region().getRegionList();
    regionItems.value = data;
  };

  onMounted(() => {
    getRegionList();
  });

  const region = ref(null);
  const importCluster = (): void => {
    region.value.open();
  };

  const toClusterDetail = (item: Region) => {
    router.push({
      name: 'admin-pai-cluster-detail',
      params: {
        ...routeParams.value,
        name: item.name,
      },
    });
  };

  const editCluster = (item: Region) => {
    region.value.init(item);
    region.value.open();
  };

  const removeCluster = (item: Region): void => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.cluster')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.cluster')])} ${item.name}`,
        type: 'delete',
        name: item.name,
      },
      param: { item },
      doFunc: async (param) => {
        if (param.item.name.length > 0) {
          await new Region(param.item).deleteRegion();
          getRegionList();
        }
      },
    });
  };
</script>

<style lang="scss" scoped>
  .cluster {
    &__desc {
      line-height: 24px;
    }
  }
</style>
