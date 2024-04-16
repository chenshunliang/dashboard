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
    min-width="1160px"
    nudge-right="12"
    nudge-top="20"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="on">
      <v-row v-on="on">
        <v-col v-for="(item, index) in env" :key="index" class="pa-0" cols="4">
          <v-flex
            v-if="item.name !== 'PASSWORD' && item.name !== 'JUPYTER_TOKEN'"
            class="grey lighten-4 rounded mb-3 mx-3"
          >
            <v-list-item>
              <v-list-item-content class="kubegems__label-class-padding kubegems__break-all">
                <strong class="mr-2 primary--text py-1"> {{ item.name }} </strong>
                {{ item.value }}
              </v-list-item-content>

              <v-btn color="primary" dark fab right text x-small @click="updateEnv(index)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn color="error" dark fab right text x-small @click="removeEnv(index)">
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
                {{ i18n.t('operate.add_c', [i18nLocal.t('tip.env')]) }}
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </template>
    <v-card>
      <v-card-text class="pa-2">
        <BaseSubTitle :title="i18nLocal.t('tip.env')" />
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-row class="ma-0">
            <v-col cols="6">
              <v-switch
                v-model="state.loadFromFile"
                hide-details
                :label="i18nLocal.t('tip.from_env_file')"
                :readonly="state.edit"
              />
            </v-col>
          </v-row>
          <v-row v-if="state.loadFromFile" class="ma-0">
            <v-col cols="12">
              <BaseFileUploader @addfile="addFile" @removefile="removeFile" />
            </v-col>
          </v-row>
          <v-row v-else class="ma-0">
            <v-col cols="6">
              <v-text-field v-model.trim="obj.name" :label="i18nLocal.t('tip.name')" required :rules="objRules.name" />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.value"
                :label="i18nLocal.t('tip.value')"
                required
                :rules="objRules.value"
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
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="addEnv">
          {{ i18n.t('operate.confirm') }}
        </v-btn>
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import BaseFileUploader from '@kubegems/components/baseComponents/BaseFileUploader.vue';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { parse } from 'envfile';
  import { Base64 } from 'js-base64';
  import { reactive, ref, watch } from 'vue';

  import { Env } from '../../api/job';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const props = withDefaults(
    defineProps<{
      value: Env[];
    }>(),
    {
      value: () => [],
    },
  );

  const state = reactive({
    menu: false,
    valid: false,
    edit: false,
    index: -1,
    loadFromFile: false,
  });

  const env = ref<Env[]>([]);

  const obj = ref({
    name: '',
    value: '',
  });
  const objRules = {
    name: [required],
    value: [required],
  };

  const files = ref<File[]>([]);
  const addFile = (file: File): void => {
    if (!files.value.some((f) => f.name === file.name)) files.value.push(file);
  };
  const removeFile = (file: File): void => {
    const index = files.value.findIndex((f) => f.name === file.name);
    if (index > -1) files.value.splice(index, 1);
  };

  const form = ref(null);
  const emit = defineEmits(['input', 'change', 'overlay']);
  const addEnv = (): void => {
    state.menu = false;
    if (form.value.validate(true)) {
      if (state.loadFromFile) {
        files.value?.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = async function () {
            try {
              const base64data = (reader.result as string)?.split(',')[1];
              const content = Base64.decode(base64data);
              const data = parse(content);
              for (const key in data) {
                if (
                  !env.value.some((e) => {
                    return e.name === key || !Boolean(key);
                  })
                )
                  env.value.push({
                    name: key,
                    value: data[key],
                  });
              }
              emit('input', env.value);
              emit('change', env.value);
            } catch (e) {
              store.commit('SET_SNACKBAR', {
                text: i18n.t('tip.file_read_error'),
                color: 'error',
              });
            }
          };
          reader.readAsDataURL(file);
        });
      } else {
        if (state.edit) {
          env.value[state.index] = obj.value;
        } else {
          env.value.push(deepCopy(obj.value));
        }
        emit('input', env.value);
        emit('change', env.value);
      }
      close();
    }
  };

  const removeEnv = (index: number): void => {
    env.value.splice(index, 1);
    emit('input', env.value);
    emit('change', env.value);
  };

  const updateEnv = (index: number): void => {
    state.edit = true;
    state.index = index;
    obj.value = deepCopy(env.value[index]);
    state.menu = true;
    emit('overlay', true);
  };

  const close = (): void => {
    state.menu = false;
    emit('overlay', false);
    obj.value = {
      name: '',
      value: '',
    };
    form.value.resetValidation();
    state.edit = false;
    state.index = -1;
    state.loadFromFile = false;
  };

  const open = (): void => {
    state.menu = true;
    emit('overlay', true);
  };

  watch(
    () => props.value,
    (newValue) => {
      if (newValue) {
        env.value = deepCopy(newValue);
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>
