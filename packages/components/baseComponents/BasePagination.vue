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
  <v-flex class="text-center pa-4">
    <v-flex class="pagination__height">
      <v-flex :id="pid" class="pagination">
        <v-pagination
          v-model="page"
          class="float-left"
          :length="pageCount"
          :total-visible="visibleNum"
          @input="pageInput"
        />
        <div v-if="pageCount * size > 10 && showSize" class="text-body-2 float-left ml-2 pagination__count">
          {{ i18n.t('pagination.count') }}
          <v-menu
            v-model="state.menu"
            :attach="`#${pid}`"
            left
            nudge-bottom="-5px"
            offset-y
            origin="bottom center"
            top
            transition="scale-transition"
          >
            <template #activator="{ on }">
              <v-btn class="primary--text mt-n1" color="white" dark depressed small v-on="on">
                {{ size }}
                <v-icon v-if="state.menu" right>mdi-chevron-up</v-icon>
                <v-icon v-else right>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-data-iterator hide-default-footer :items="[{ text: '', values: [10, 20, 50, 100] }]">
              <template #default="props">
                <v-card v-for="item in props.items" :key="item.text" flat>
                  <v-list dense>
                    <v-flex class="text-body-2 text-center ma-2">
                      <span>{{ i18n.t('pagination.count') }}</span>
                    </v-flex>
                    <v-divider class="mx-2" />
                    <v-list-item
                      v-for="(s, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center"
                      link
                      :style="{ color: s === size ? `var(--primary-color) !important` : `` }"
                      @click="setSize(s)"
                    >
                      <v-list-item-content>
                        <span class="font-weight-medium">{{ s }}</span>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </template>
            </v-data-iterator>
          </v-menu>
        </div>
        <div class="kubegems__clear-float" />
      </v-flex>
    </v-flex>
  </v-flex>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { reactive, ref, watch } from 'vue';

  const i18n = useGlobalI18n();

  const props = withDefaults(
    defineProps<{
      frontPage?: boolean;
      page?: number;
      pageCount?: number;
      pid?: string;
      showSize?: boolean;
      size?: number;
      visibleNum?: number;
      value: number;
    }>(),
    {
      frontPage: false,
      page: 1,
      pageCount: 0,
      pid: 'pagesize',
      showSize: true,
      size: 10,
      visibleNum: 6,
      value: 1,
    },
  );
  const state = reactive({
    menu: false,
  });

  const emit = defineEmits(['changepage', 'loaddata', 'changesize']);
  const page = ref<number>(1);
  const pageInput = () => {
    emit('changepage', page.value);
    // if (page.value === props.page) return;
    if (!props.frontPage) {
      emit('loaddata');
    } else {
      if (page.value === 1) {
        emit('loaddata');
      }
    }
  };

  const setSize = (size: number): void => {
    page.value = 1;
    emit('changesize', size);
    emit('loaddata');
  };

  watch(
    () => props.value,
    () => {
      page.value = props.value;
    },
    { immediate: true },
  );
</script>

<style lang="scss">
  .pagination {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0%);

    &__height {
      height: 40px;
    }

    &__count {
      line-height: 44px !important;
    }
  }
</style>
