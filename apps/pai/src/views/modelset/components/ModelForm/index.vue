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
    icon="mdi-database"
    :intro="intro"
    :intro-width="700"
    :title="
      state.edit
        ? i18n.t('operate.update_c', [i18nLocal.t('resource.model')])
        : i18n.t('operate.create_c', [i18nLocal.t('resource.model')])
    "
    :width="800"
    @reset="reset"
  >
    <template #content>
      <component :is="components[state.step]" ref="form" :edit="state.edit" :set="obj" @refresh="refresh" />
    </template>
    <template #intro>
      <div class="divider" />
      <Intro component="HuggingFace" />
    </template>
    <template #action>
      <v-btn
        v-if="state.step === 1"
        class="float-right mx-2"
        color="primary"
        :loading="store.state.Circular"
        text
        @click="confirm"
      >
        {{ i18n.t('operate.confirm') }}
      </v-btn>
      <v-btn
        v-if="state.step >= 0 && state.step < state.totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="next"
      >
        {{ i18n.t('operate.next') }}
      </v-btn>
      <v-btn
        v-if="state.step > 0 && state.step <= state.totalStep - 1"
        class="float-right mx-2"
        color="primary"
        text
        @click="previous"
      >
        {{ i18n.t('operate.previous') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { computed, reactive, ref } from 'vue';

  import { SetConfig } from '../../../../api/base';
  import { Modelset } from '../../../../api/modelset';
  import DataSource from '../../../components/DataSource/index.vue';
  import Intro from '../../../components/DataSource/Intro.vue';
  import { useI18n } from '../../i18n';
  import BaseInfo from './BaseInfo.vue';

  const props = withDefaults(
    defineProps<{
      share?: boolean;
    }>(),
    {
      share: false,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    step: 0,
    totalStep: 2,
    edit: false,
  });

  let components = ref([DataSource, BaseInfo]);

  const obj = ref<Modelset>(new Modelset());

  const intro = computed(() => {
    const [download] = obj.value.downloaders;
    return download?.kind === 'HuggingFace';
  });

  const refresh = (item: Modelset) => {
    obj.value = deepCopy(item);
  };

  const open = (): void => {
    state.dialog = true;
  };
  const init = async (item: Modelset): Promise<void> => {
    state.edit = true;
    const data = await new Modelset(item).getModelset();
    if (!data.config) {
      data.config = new SetConfig();
    }
    obj.value = data;
  };
  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const emit = defineEmits(['refresh']);
  const confirm = async (): Promise<void> => {
    if (form.value.validate(true)) {
      obj.value.tenant = props.share ? 'default' : store.getters.Tenant().TenantName;
      obj.value.region = store.getters.Region().RegionName;
      obj.value.public = props.share;
      if (state.edit) {
        await new Modelset(obj.value).updateModelset();
      } else {
        await new Modelset(obj.value).addModelset();
      }
      reset();
      emit('refresh');
    }
  };

  const next = async (): Promise<void> => {
    if (form.value.validate()) {
      state.step += 1;
    }
  };
  const previous = (): void => {
    state.step -= 1;
  };

  const reset = (): void => {
    state.dialog = false;
    state.step = 0;
    state.edit = false;
    form.value.reset();
    obj.value = new Modelset();
  };
</script>

<style lang="scss" scoped>
  .divider {
    position: absolute;
    margin-left: 5px;
    height: calc(100% - 80px);
    border: 0.8px solid #efefef;
  }
</style>
