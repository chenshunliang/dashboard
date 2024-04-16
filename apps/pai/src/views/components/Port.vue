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
  <v-menu
    v-model="state.menu"
    bottom
    :close-on-click="false"
    :close-on-content-click="false"
    left
    :min-width="width"
    nudge-right="12"
    nudge-top="20"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="on">
      <v-row v-on="on">
        <v-col v-for="(item, index) in port" :key="index" class="pa-0" cols="4">
          <v-flex class="grey lighten-4 rounded mb-3 mx-3">
            <v-list-item>
              <v-list-item-content class="kubegems__label-class-padding kubegems__break-all">
                <strong class="mr-2 primary--text py-1"> {{ item.name }} </strong>
                {{ item.port }}
              </v-list-item-content>

              <v-btn color="primary" dark fab right text x-small @click="updatePort(index)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn color="error" dark fab right text x-small @click="removePort(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </v-flex>
        </v-col>
      </v-row>

      <v-flex class="grey lighten-4 rounded mt-3">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-2 py-0 text-center">
              <v-btn color="primary" text @click="open">
                <v-icon left small> mdi-plus-box </v-icon>
                {{ i18n.t('operate.add_c', [i18nLocal.t('tip.port')]) }}
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </template>
    <v-card>
      <v-card-text class="pa-2">
        <BaseSubTitle :title="i18nLocal.t('tip.port')" />
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-row class="ma-0">
            <v-col cols="6">
              <v-text-field v-model.trim="obj.name" :label="i18nLocal.t('tip.name')" required :rules="objRules.name" />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="obj.port"
                :label="i18nLocal.t('tip.port')"
                required
                :rules="objRules.port"
                type="number"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn class="mr-2 mb-2" color="error" dark right small text @click="close">
          {{ i18n.t('operate.close') }}
        </v-btn>
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="addPort">
          {{ i18n.t('operate.confirm') }}
        </v-btn>
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref, watch } from 'vue';

  import { Port } from '../../api/job';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const props = withDefaults(
    defineProps<{
      value: Port[];
      width?: string;
    }>(),
    {
      value: () => [],
      width: '1160px',
    },
  );

  const state = reactive({
    menu: false,
    valid: false,
    edit: false,
    index: -1,
  });

  const port = ref<Port[]>([]);

  const obj = ref({
    name: '',
    port: 0,
  });
  const objRules = {
    name: [required],
    port: [required],
  };

  const form = ref(null);
  const emit = defineEmits(['input', 'change', 'overlay']);
  const addPort = (): void => {
    state.menu = false;
    if (form.value.validate(true)) {
      if (state.edit) {
        port.value[state.index] = obj.value;
      } else {
        port.value.push(deepCopy(obj.value));
      }
      emit('input', port.value);
      emit('change', port.value);

      close();
    }
  };

  const removePort = (index: number): void => {
    port.value.splice(index, 1);
    emit('input', port.value);
    emit('change', port.value);
  };

  const updatePort = (index: number): void => {
    state.edit = true;
    state.index = index;
    obj.value = deepCopy(port.value[index]);
    state.menu = true;
    emit('overlay', true);
  };

  const close = (): void => {
    state.menu = false;
    emit('overlay', false);
    obj.value = {
      name: '',
      port: 0,
    };
    form.value.resetValidation();
    state.edit = false;
    state.index = -1;
  };

  const open = (): void => {
    state.menu = true;
    emit('overlay', true);
  };

  watch(
    () => props.value,
    (newValue) => {
      if (newValue) {
        port.value = deepCopy(newValue);
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>
