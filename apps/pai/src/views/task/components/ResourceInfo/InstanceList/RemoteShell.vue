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
    icon="mdi-powershell"
    :title="i18nLocal.t('tip.remote_shell')"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <v-card class="pa-0" flat>
        <v-card-text class="px-2 pt-0 pb-2">
          <v-card class="my-2 pa-3 card kubegems__pointer" @click="openWebShell">
            <v-card-text class="pa-1">
              <v-flex class="float-left">
                <v-icon color="primary" left> mdi-console-line </v-icon>
              </v-flex>
              <v-flex class="text-subtitle-2 primary--text">{{ i18nLocal.t('tip.webshell') }}</v-flex>
              <v-flex class="text-body-2"> {{ i18nLocal.t('tip.webshell_desc') }} </v-flex>
              <div class="kubegems__clear-float" />
            </v-card-text>
          </v-card>

          <v-card class="my-2 pa-3 card kubegems__pointer">
            <v-card-text class="pa-1">
              <v-flex class="float-left">
                <v-icon color="primary" left> mdi-ssh </v-icon>
              </v-flex>
              <v-flex class="text-subtitle-2 primary--text">{{ i18nLocal.t('tip.ssh') }}</v-flex>
              <v-flex class="text-body-2"> {{ i18nLocal.t('tip.ssh_desc') }} </v-flex>
              <div class="kubegems__clear-float" />
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { Pod } from '@kubegems/api/typed/pod';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../../i18n';

  const i18nLocal = useI18n();

  const state = reactive({
    dialog: false,
  });

  const reset = () => {
    state.dialog = false;
  };

  const pod = ref<Pod>(new Pod());

  const open = () => {
    state.dialog = true;
  };
  const init = (item: Pod) => {
    pod.value = deepCopy(item);
  };
  defineExpose({
    open,
    init,
  });

  const emit = defineEmits(['openWebShell']);
  const openWebShell = (): void => {
    emit('openWebShell', pod.value);
    reset();
  };
</script>

<style lang="scss" scoped>
  .card {
    border: 2px solid var(--primary-color);
  }
</style>
