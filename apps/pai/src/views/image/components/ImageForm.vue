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
    icon="mdi-box-shadow"
    :title="
      state.edit
        ? i18n.t('operate.update_c', [state.public ? i18nLocal.t('resource.opensource') : i18nLocal.t('resource.self')])
        : i18n.t('operate.add_c', [state.public ? i18nLocal.t('resource.opensource') : i18nLocal.t('resource.self')])
    "
    :width="1000"
    @reset="reset"
  >
    <template #content>
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <v-flex :class="state.overlay ? 'kubegems__overlay' : ''" />
        <BaseSubTitle
          :title="
            i18n.t('form.definition', [
              state.public ? i18nLocal.t('resource.opensource') : i18nLocal.t('resource.self'),
            ])
          "
        />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.trim="obj.name"
                :label="i18nLocal.t('tip.image_name')"
                :readonly="state.edit"
                required
                :rules="objRules.name"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model.trim="obj.description"
                auto-grow
                :label="i18nLocal.t('tip.image_desc')"
                required
                :rules="objRules.description"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.trim="obj.image"
                :label="i18nLocal.t('tip.image_address')"
                required
                :rules="objRules.image"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <BaseSubTitle :title="i18nLocal.t('tip.label_info')" />
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="6">
              <v-autocomplete
                v-model.trim="obj.labels.for"
                color="primary"
                :items="forItems"
                :label="i18nLocal.t('tip.for')"
                :no-data-text="i18n.t('data.no_data')"
                :rules="objRules.for"
              >
                <template #selection="{ item }">
                  <v-chip color="primary" small>
                    {{ item.text }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                v-model.trim="obj.labels.processor"
                color="primary"
                :items="processorItems"
                :label="i18nLocal.t('tip.processor')"
                :no-data-text="i18n.t('data.no_data')"
              >
                <template #selection="{ item }">
                  <v-chip color="primary" small>
                    {{ item.text }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                v-model.trim="obj.labels.framework"
                color="primary"
                :items="frameworkItems"
                :label="i18nLocal.t('tip.framework')"
                :no-data-text="i18n.t('data.no_data')"
                :search-input.sync="frameworkText"
                @keydown.enter="createFramework"
              >
                <template #selection="{ item }">
                  <v-chip color="primary" small>
                    {{ item.text }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.trim="obj.labels.python" :label="i18nLocal.t('tip.python')" required />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.trim="obj.labels.os" :label="i18nLocal.t('tip.os')" required />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.trim="obj.labels.cuda" :label="i18nLocal.t('tip.cuda')" required />
            </v-col>
          </v-row>
        </v-card-text>

        <BaseSubTitle :title="i18nLocal.t('tip.port_conf')" />
        <v-card-text class="pa-2">
          <v-row class="mt-0">
            <v-col cols="12">
              <Port v-model="obj.config.ports" width="960px" @overlay="changeOverlayState" />
            </v-col>
          </v-row>
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

  import { Image } from '../../../api/image';
  import Port from '../../components/Port.vue';
  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
    edit: false,
    overlay: false,
    public: false,
  });

  const processorItems = [
    { text: 'CPU', value: 'cpu' },
    { text: 'GPU', value: 'gpu' },
  ];

  const forItems = [
    { text: i18nLocal.t('tip.modeling'), value: 'modeling' },
    { text: i18nLocal.t('tip.training'), value: 'training' },
    { text: i18nLocal.t('tip.generic'), value: 'generic' },
    { text: i18nLocal.t('tip.inference'), value: 'inference' },
    { text: i18nLocal.t('tip.dataclean'), value: 'clean' },
  ];

  const obj = ref<Image>(new Image());
  const objRules = {
    name: [
      required,
      (v) => !v || !!new RegExp('^[a-z]{1}[-a-z0-9\\._]{0,50}$').test(v) || i18nLocal.t('ruler.image_name'),
    ],
    description: [],
    image: [
      required,
      (v) =>
        !v || !!new RegExp('^[-\\._a-zA-Z0-9/]+:?[-_a-zA-Z0-9\\.]+$').test(v) || i18nLocal.t('ruler.image_address'),
    ],
    for: [required],
  };

  const open = (pub = false): void => {
    state.public = pub;
    state.dialog = true;
  };
  const init = async (item: Image, pub = false): Promise<void> => {
    state.edit = true;
    state.public = pub;
    if (pub) {
      obj.value = await new Image(item).getPublicImage();
    } else {
      obj.value = await new Image(item).getImage();
    }
    if (!obj.value.labels) obj.value.labels = {};
    if (
      obj.value.labels['framework'] &&
      !frameworkItems.value.some((f) => {
        return f.value === obj.value.labels['framework'];
      })
    ) {
      frameworkItems.value.push({ text: obj.value.labels['framework'], value: obj.value.labels['framework'] });
    }
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      obj.value.tenant = store.getters.Tenant().TenantName;
      if (state.edit) {
        state.public ? await new Image(obj.value).updatePublicImage() : await new Image(obj.value).updateImage();
      } else {
        state.public ? await new Image(obj.value).addPublicImage() : await new Image(obj.value).addImage();
      }
      reset();
      emit('refresh');
    }
  };

  const reset = (): void => {
    state.dialog = false;
    state.edit = false;
    state.public = false;
    form.value.resetValidation();
    obj.value = new Image();
  };

  const changeOverlayState = (_overlay): void => {
    state.overlay = _overlay;
  };

  const frameworkText = ref('');
  const frameworkItems = ref([
    { text: 'code-server', value: 'code-server' },
    { text: 'jupyter', value: 'jupyter' },
    { text: 'pytorch', value: 'pytorch' },
    { text: 'torch', value: 'torch' },
    { text: 'tensorflow', value: 'tensorflow' },
  ]);
  const createFramework = () => {
    if (frameworkItems.value.find((f) => f.value === frameworkText.value.trim())) return;
    frameworkItems.value.push({ text: frameworkText.value.trim(), value: frameworkText.value.trim() });
    obj.value.labels['framework'] = frameworkText.value.trim();
    frameworkText.value = '';
  };
</script>
