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
    <BaseSubTitle :title="i18nLocal.t('tip.base_info')" />
    <v-card-text class="pa-2">
      <v-row v-if="obj.config">
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.config.extraInfo.taskType"
            color="primary"
            :items="taskItems"
            :label="i18nLocal.t('tip.task_type')"
            :no-data-text="i18n.t('data.no_data')"
            :rules="objRules.taskType"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.config.extraInfo.framework"
            color="primary"
            :items="modelItems"
            :label="i18nLocal.t('tip.model_type')"
            :no-data-text="i18n.t('data.no_data')"
            :rules="objRules.framework"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small>
                {{ item }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="obj.config.extraInfo.description"
            auto-grow
            :label="i18nLocal.t('tip.model_desc')"
            required
            :rules="objRules.description"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="obj.config.extraInfo.version"
            :label="i18nLocal.t('tip.version')"
            required
            :rules="objRules.version"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-form>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { reactive, ref } from 'vue';

  import { AsyncTask } from '../../../../api/task';
  import { useI18n } from '../../i18n';

  const props = withDefaults(
    defineProps<{
      task?: AsyncTask;
    }>(),
    {
      task: void 0,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const state = reactive({
    valid: false,
  });

  const obj = ref<AsyncTask>(props.task);

  const taskItems = [
    'audio-classification',
    'audio-to-audio',
    'automatic-speech-recognition',
    'conversational',
    'document-question-answering',
    'feature-extraction',
    'fill-mask',
    'image-classification',
    'image-segmentation',
    'image-to-image',
    'image-to-text',
    'multiple-choice',
    'object-detection',
    'question-answering',
    'reinforcement-learning',
    'sentence-similarity',
    'summarization',
    'table-question-answering',
    'tabular-classification',
    'tabular-regression',
    'text-classification',
    'text-generation',
    'text-to-image',
    'text-to-speech',
    'text2text-generation',
    'time-series-forecasting',
    'token-classification',
    'translation',
    'unconditional-image-generation',
    'visual-question-answering',
    'voice-activity-detection',
    'zero-shot-classification',
    'zero-shot-image-classification',
  ];

  const modelItems = [
    'FastAI',
    'JoeyNMT',
    'PyTorch',
    'PyTorch Lightning',
    'adapter-transformers',
    'allennlp',
    'asteroid',
    'diffusers',
    'doctr',
    'espnet',
    'fairseq',
    'fastai',
    'faster_rcnn',
    'fastpitch',
    'fasttext',
    'flair',
    'generic',
    'k2',
    'k2-sherpa',
    'keras',
    'mask_rcnn',
    'ml-agents',
    'mlconsole',
    'nemo',
    'opennmt',
    'pyannote-audio',
    'pythae',
    'pytorch',
    'pytorch-lightning',
    'sample-factory',
    'sentence-transformers',
    'sklearn',
    'spacy',
    'speechbrain',
    'stable-baselines3',
    'stable-diffusion',
    'stanza',
    'superb',
    'tensorflowtts',
    'tfhub',
    'timm',
    'transformers',
  ];

  const objRules = {
    taskType: [required],
    framework: [required],
    description: [required],
    version: [required],
  };

  const form = ref(null);
  const validate = (): boolean => {
    return form.value.validate();
  };

  const reset = (): void => {
    form.value.resetValidation();
  };

  defineExpose({
    validate,
    reset,
  });
</script>
