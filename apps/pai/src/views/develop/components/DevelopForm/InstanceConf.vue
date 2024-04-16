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
    <BaseSubTitle :title="i18nLocal.t('tip.spec')" />
    <v-card-text class="pa-2">
      <SpecTable v-model="obj.config.roles[0].sku" :job="job" />
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.base_conf')" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col v-if="!edit" cols="6">
          <v-text-field
            v-model="password"
            required
            :rules="objRules.password"
            :type="state.passwordShow ? 'text' : 'password'"
            @change="passwordChange"
          >
            <template #label>
              {{ i18nLocal.t('tip.password') }}
              <span class="orange--text ml-2">{{ i18nLocal.t('tip.password_tip') }}</span>
            </template>
            <template #append>
              <v-btn
                color="primary"
                icon
                :readonly="edit"
                small
                :style="{ marginTop: '-3px' }"
                @click.stop="state.passwordShow = !state.passwordShow"
              >
                <v-icon small>{{ state.passwordShow ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
              </v-btn>
              <v-btn class="mt-n1" color="primary" small text @click.stop="randomPassword">
                {{ i18nLocal.t('tip.generate_passwd') }}
              </v-btn>
            </template>
          </v-text-field>
        </v-col>
      </v-row>
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.image_conf')" />
    <v-card-text class="pa-2">
      <ImageConf
        v-model="obj.config.roles[0].image"
        :edit="edit"
        for="modeling"
        @outputImage="outputImage"
        @overlay="changeOverlayState"
      />
    </v-card-text>

    <BaseSubTitle :title="i18nLocal.t('tip.data_conf')" />
    <v-card-text class="pa-2">
      <SetMount v-model="obj.config.roles[0].volumeMountSets" @overlay="changeOverlayState" />
    </v-card-text>

    <template v-if="false">
      <BaseSubTitle :title="i18nLocal.t('tip.env')" />
      <v-card-text class="pa-2">
        <v-row class="mt-0">
          <v-col cols="12">
            <Env v-model="obj.config.roles[0].env" @overlay="changeOverlayState" />
          </v-col>
        </v-row>
      </v-card-text>
    </template>

    <BaseSubTitle :title="i18nLocal.t('tip.advanced')" />
    <v-card-text class="pa-2">
      <v-switch v-model="state.advanced" class="float-left" hide-details :label="i18nLocal.t('tip.enabled')" />
      <div class="kubegems__clear-float" />
      <v-row v-if="state.advanced" class="mt-0">
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.roles[0].shmSize"
            :label="i18nLocal.t('tip.shmSize')"
            required
            :rules="objRules.shmSize"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.roles[0].workingDir"
            :label="i18nLocal.t('tip.working_dir')"
            required
            :rules="objRules.workingDir"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref, watch } from 'vue';

  import { Image } from '../../../../api/image';
  import { Job } from '../../../../api/job';
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
        state.advanced = Boolean(
          parseFloat(obj.value.config.roles?.[0]?.shmSize) || obj.value.config.roles?.[0]?.workingDir,
        );
      }
    },
    { deep: true },
  );

  const state = reactive({
    valid: false,
    overlay: false,
    passwordShow: false,
    advanced: false,
  });

  const obj = ref(props.job);
  const objRules = {
    image: [required],
    password: [],
    shmSize: [(v) => !!new RegExp('(^\\d+[K|M|G|T]i$)|(^0$)').test(v) || i18nLocal.t('tip.storage_rule')],
    workingDir: [],
  };

  const password = ref('');
  const randomPassword = (): void => {
    let s = '';
    const t = 'abcdefhijkmnprstwxyz';
    for (let i = 0; i < 4; i++) s += t.charAt(Math.floor(Math.random() * t.length));
    const n = '1234567890';
    for (let i = 0; i < 4; i++) s += n.charAt(Math.floor(Math.random() * n.length));
    const u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 4; i++) s += u.charAt(Math.floor(Math.random() * u.length));
    const f = '!@#$%';
    for (let i = 0; i < 2; i++) s += f.charAt(Math.floor(Math.random() * f.length));
    password.value = s;
  };
  const image = ref<Image>(new Image());
  const outputImage = (item: Image): void => {
    image.value = item;
    obj.value.config.roles[0].ports = item.config.ports;
    passwordChange();
  };
  const passwordChange = (): void => {
    const envName = image.value.labels?.framework === 'jupyter' ? 'JUPYTER_TOKEN' : 'PASSWORD';
    obj.value.annotations['pai.kubegems.io/im-type'] =
      image.value.labels?.framework === 'jupyter' ? 'jupyter' : 'code-server';
    const index = obj.value.config.roles[0].env.findIndex((d) => {
      return d.name === envName;
    });
    if (index > -1) {
      obj.value.config.roles[0].env[index] = {
        name: envName,
        value: password.value,
      };
    } else {
      obj.value.config.roles[0].env.push({
        name: envName,
        value: password.value,
      });
    }
  };

  const changeOverlayState = (_overlay): void => {
    state.overlay = _overlay;
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
</script>

<style lang="scss" scoped>
  .v-list--three-line .v-list-item,
  .v-list-item--three-line {
    min-height: 48px;
  }
</style>
