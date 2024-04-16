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
    <BaseSubTitle :title="i18nLocal.t('tip.source', [i18nLocal.t(`tip.${set.kind}`)])" />
    <v-card-text class="pa-2">
      <v-row>
        <v-col v-for="item in sourceItems" :key="item.value" cols="4">
          <v-hover #default="{ hover }">
            <v-card class="kubegems__pointer set set__pos" :elevation="hover ? 2 : 0" flat @click="setSource(item)">
              <v-list-item three-line>
                <v-list-item-content>
                  <v-list-item-title class="text-body-2 kubegems__pointer">
                    <div class="float-left">
                      <BaseLogo
                        class="mr-2"
                        :color="store.state.ThemeColor"
                        :icon-name="item.icon"
                        :ml="0"
                        :mt="1"
                        :width="25"
                      />
                    </div>
                    <div class="float-left set__title">
                      {{ item.text }}
                    </div>
                    <div class="kubegems__clear-float" />
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="text-body-2">
                      {{ item.desc }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <template v-if="item.value === source">
                <v-flex class="set__watermark-bg" />
                <v-flex class="set__watermark font-weight-medium"> {{ i18nLocal.t('tip.now_select') }} </v-flex>
              </template>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-card-text>

    <template v-if="source === 'URI'">
      <BaseSubTitle :title="i18nLocal.t('tip.uri_conf')" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col>
            <v-textarea
              v-model="obj.downloaders[0].config.urls"
              auto-grow
              :label="i18nLocal.t('tip.uri')"
              required
              :rules="objRules.uri"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </template>

    <template v-else-if="source === 'HuggingFace'">
      <BaseSubTitle :title="i18nLocal.t('tip.huggingface_conf')" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col>
            <v-text-field
              v-model.trim="obj.downloaders[0].config.name"
              :label="i18nLocal.t('tip.name')"
              required
              :rules="objRules.name"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model.trim="obj.downloaders[0].config.token"
              :append-icon="state.showHuggingFaceToken ? 'mdi-eye' : 'mdi-eye-off'"
              label="Token"
              required
              :rules="objRules.huggingfaceToken"
              :type="state.showHuggingFaceToken ? 'text' : 'password'"
              @click:append="state.showHuggingFaceToken = !state.showHuggingFaceToken"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </template>

    <template v-else-if="source === 'ModelX'">
      <BaseSubTitle :title="i18nLocal.t('tip.modelx_conf')" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col>
            <v-text-field v-model.trim="obj.downloaders[0].config.url" label="URL" required :rules="objRules.url" />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model.trim="obj.downloaders[0].config.token"
              :append-icon="state.showModelXToken ? 'mdi-eye' : 'mdi-eye-off'"
              label="Token"
              required
              :rules="objRules.modelxToken"
              :type="state.showModelXToken ? 'text' : 'password'"
              @click:append="state.showModelXToken = !state.showModelXToken"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </template>

    <template v-else-if="source === 'Git'">
      <BaseSubTitle :title="i18nLocal.t('tip.git_conf')" />
      <v-card-text class="pa-2">
        <v-row>
          <v-col>
            <v-text-field v-model.trim="obj.downloaders[0].config.url" label="URL" required :rules="objRules.url" />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model.trim="obj.downloaders[0].config.token"
              :append-icon="state.showModelXToken ? 'mdi-eye' : 'mdi-eye-off'"
              label="Token"
              required
              :rules="objRules.modelxToken"
              :type="state.showModelXToken ? 'text' : 'password'"
              @click:append="state.showModelXToken = !state.showModelXToken"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </template>
  </v-form>
</template>

<script lang="ts" setup>
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { computed, reactive, ref, watch } from 'vue';

  import { Downloader, HuggingfaceConfig, ModelXConfig, UriConfig } from '../../../api/base';
  import { Dataset } from '../../../api/dataset';
  import { Modelset } from '../../../api/modelset';
  import { useI18n } from '../i18n';

  const props = withDefaults(
    defineProps<{
      set?: Dataset | Modelset;
      edit?: boolean;
    }>(),
    {
      set: void 0,
      edit: false,
    },
  );

  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    valid: false,
    overlay: false,
    showHuggingFaceToken: false,
    showModelXToken: false,
  });

  // const changeOverlayState = (_overlay: boolean): void => {
  //   state.overlay = _overlay;
  // };

  const source = ref('Default');
  const sourceItems = computed(() => {
    const items = [
      {
        text: i18nLocal.t('tip.self_set', [i18nLocal.t(`tip.${props.set.kind}`)]),
        value: 'Default',
        icon: 'mdi:archive',
        desc: i18nLocal.t(`tip.self_desc`, [i18nLocal.t(`tip.${props.set.kind}`)]),
      },
      {
        text: i18nLocal.t('tip.from_url'),
        value: 'URI',
        icon: 'mdi:cloud-download',
        desc: i18nLocal.t('tip.uri_desc', [i18nLocal.t(`tip.${props.set.kind}`)]),
      },
      {
        text: i18nLocal.t('tip.from_huggingface'),
        value: 'HuggingFace',
        icon: 'huggingface',
        desc: i18nLocal.t('tip.huggingface_desc'),
      },
      {
        text: i18nLocal.t('tip.from_modelx'),
        value: 'ModelX',
        icon: 'modelx',
        desc: i18nLocal.t('tip.modelx_desc'),
      },
      {
        text: i18nLocal.t('tip.from_git'),
        value: 'Git',
        icon: 'git',
        desc: i18nLocal.t('tip.git_desc'),
      },
    ];
    if (props.set.kind === 'dataset') {
      items.push({
        text: i18nLocal.t('tip.from_etl'),
        value: 'etl',
        icon: 'mdi:file-find',
        desc: i18nLocal.t('tip.etl_desc'),
      });
    } else {
      // items.push({
      //   text: i18nLocal.t('tip.from_output'),
      //   value: 'output',
      //   icon: 'mdi:location-enter',
      //   desc: i18nLocal.t('tip.output_desc'),
      // });
    }
    return items;
  });

  const obj = ref<Modelset | Dataset>(props.set);
  const objRules = {
    uri: [
      required,
      (v) =>
        !v ||
        !!new RegExp('^(http[s]?://[-1-9a-zA-Z_#\\*\\.:@]+;?)+$', 'gi').test(v.trim()) ||
        i18nLocal.t('ruler.uri'),
    ],
    modelxToken: [required],
    huggingfaceToken: [required],
    name: [required],
    url: [required],
  };

  watch(
    () => props.set,
    (newValue) => {
      if (newValue) {
        obj.value = newValue;
        const [download] = obj.value.downloaders;
        source.value = download?.kind || 'Default';
      }
    },
    { deep: true, immediate: true },
  );

  const emit = defineEmits(['refresh']);
  const setSource = (item: any): void => {
    if (props.edit) return;
    if (item.value === 'URI') {
      obj.value.downloaders = [new Downloader({ name: 'uri', kind: 'URI', config: new UriConfig({ urls: '' }) })];
    } else if (item.value === 'HuggingFace') {
      obj.value.downloaders = [
        new Downloader({
          name: 'huggingface',
          kind: 'HuggingFace',
          config: new HuggingfaceConfig({ name: '', token: '' }),
        }),
      ];
    } else if (item.value === 'ModelX') {
      obj.value.downloaders = [
        new Downloader({ name: 'modelx', kind: 'ModelX', config: new ModelXConfig({ urls: '', token: '' }) }),
      ];
    } else if (item.value === 'Git') {
      obj.value.downloaders = [
        new Downloader({ name: 'git', kind: 'Git', config: new ModelXConfig({ urls: '', token: '' }) }),
      ];
    } else {
      obj.value.downloaders = [];
    }
    source.value = item.value;
    obj.value.source = item.value.toLocaleLowerCase();
    emit('refresh', obj.value);
  };

  const form = ref<any>(null);
  const validate = (): boolean => {
    return form.value.validate();
  };

  const reset = (): void => {
    form.value.resetValidation();
    source.value = 'Default';
  };

  defineExpose({
    validate,
    reset,
  });
</script>

<style lang="scss" scoped>
  .set {
    border: 2px solid var(--primary-color);

    &__title {
      line-height: 32.4px;
    }

    &__pos {
      position: relative;
      background-color: #ffffff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__watermark-bg {
      position: absolute;
      width: 100px;
      height: 90px;
      transform: rotate(47deg);
      top: -46px;
      right: -55px;
      background-color: var(--primary-color);
      padding: 0;
    }

    &__watermark {
      position: absolute;
      top: 10px;
      right: -4px;
      transform: rotate(47deg);
      text-transform: uppercase;
      color: white;
      font-size: 12px;
    }
  }
</style>
