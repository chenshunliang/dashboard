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
  <div class="mt-6">
    <v-row>
      <v-col v-for="(item, index) in catalogItems" :key="index" cols="3">
        <v-hover #default="{ hover }">
          <v-card
            class="white--text kubegems__pointer catalog__pos"
            :color="item.color"
            :elevation="hover ? 2 : 0"
            flat
            theme="dark"
            @click="setCatalog(item)"
          >
            <v-icon v-if="item.value === catalog" class="catalog__check" color="white">mdi-check-decagram</v-icon>
            <v-card-title class="text-h6"> {{ item.text }} </v-card-title>

            <v-card-subtitle class="white--text pt-3">
              {{ item.desc }}
            </v-card-subtitle>

            <!-- <v-card-actions>
              <v-btn class="px-0" color="white" text @click.stop="openStore(item)">
                <v-icon left small> mdi-login </v-icon>
                {{ i18nLocal.t('operate.view') }}
              </v-btn>
            </v-card-actions> -->
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import { useParams, useQuery, useRouter } from '@kubegems/extension/router';
  import { useStore } from '@kubegems/extension/store';
  import config from '@kubegems/libs/constants/global';
  import { onMounted, ref } from 'vue';

  // import { useI18n } from '../i18n';

  const router = useRouter();
  const routeParams = useParams();
  // const i18nLocal = useI18n();
  const store = useStore();
  const query = useQuery();

  const catalogItems = ref([
    {
      text: 'ModelX Hub',
      value: 'modelx',
      desc: 'ModelX提供',
      icon: 'kubegems',
      color: store.state.ThemeColor || config.theme.THEME_COLOR.primary,
    },
    {
      text: 'Hugging Face Hub',
      value: 'huggingface',
      desc: '全球最大最活跃的AI社区',
      icon: 'huggingface',
      color: '#FFB02F',
    },
  ]);
  const catalogMap = {
    modelx: 0,
    huggingface: 1,
  };
  const catalog = ref(void 0);

  const emit = defineEmits(['change', 'input']);
  const setCatalog = (item: any) => {
    catalog.value = item.value;
    router.replace({
      params: { ...routeParams.value, source: item.value },
      query: { ...query.value, source: item.value },
    });
    emit('input', item.value);
    emit('change', item.value);
  };

  onMounted(() => {
    catalog.value = catalogItems.value[catalogMap[query.value?.source || 0]]?.value || void 0;
    emit('input', catalog.value);
    emit('change', catalog.value);
  });
</script>

<style lang="scss" scoped>
  .catalog {
    border: 2px solid var(--primary-color);

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__name {
      line-height: 50px;
    }

    &__check {
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }
</style>
