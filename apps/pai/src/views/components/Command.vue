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
    nudge-top="20"
    offset-y
    origin="top center"
    transition="scale-transition"
  >
    <template #activator="on">
      <v-flex v-if="command.length > 0" class="grey lighten-4 rounded" v-on="on">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <div
              v-for="(cmd, index) in command"
              :key="index"
              class="text-body-1 py-0 text-start kubegems__text"
              v-html="`- ${cmd.replaceAll('\n', '<br />&nbsp;&nbsp;&nbsp;')}`"
            />
          </v-list-item-content>
          <v-btn color="primary" dark fab right text x-small @click="updateCommand">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn color="error" dark fab right text x-small @click="removeCommand">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item>
      </v-flex>

      <v-flex v-else class="grey lighten-4 rounded">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-2 py-0 text-center">
              <v-btn color="primary" text @click="open">
                <v-icon left small> mdi-plus-box </v-icon>
                {{ i18n.t('operate.add_c', [i18nLocal.t('tip.command')]) }}
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </template>
    <v-card>
      <v-card-text class="pa-2">
        <BaseSubTitle :title="i18nLocal.t('tip.command')" />
        <div class="px-2">
          <v-textarea v-model.trim="commandStr" auto-grow hide-details :label="i18nLocal.t('tip.command')" required />
        </div>
      </v-card-text>
      <v-card-title class="pa-0">
        <v-spacer />
        <v-btn class="mr-2 mb-2" color="error" dark right small text @click="close">
          {{ i18n.t('operate.close') }}
        </v-btn>
        <v-btn class="mr-2 mb-2" color="primary" dark right small text @click="addCommand">
          {{ i18n.t('operate.confirm') }}
        </v-btn>
      </v-card-title>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const props = withDefaults(
    defineProps<{
      value: string[];
    }>(),
    {
      value: () => [],
    },
  );

  const state = reactive({
    menu: false,
  });

  const command = ref<string[]>([]);
  const commandStr = ref<string>('');
  const emit = defineEmits(['input', 'change', 'overlay']);
  const addCommand = (): void => {
    state.menu = false;
    if (commandStr.value.length > 0) {
      command.value = ['sh', '-c', `${commandStr.value}`];
      emit('input', command.value);
      emit('change', command.value);
      close();
    }
  };

  const removeCommand = (): void => {
    commandStr.value = '';
    emit('input', []);
    emit('change', []);
  };

  const updateCommand = (): void => {
    commandStr.value = command.value[2] || '';
    state.menu = true;
    emit('overlay', true);
  };

  const close = (): void => {
    state.menu = false;
    commandStr.value = '';
    emit('overlay', false);
  };

  const open = (): void => {
    state.menu = true;
    emit('overlay', true);
  };

  watch(
    () => props.value,
    (newValue) => {
      if (newValue) {
        command.value = newValue;
        commandStr.value = command.value[2] || '';
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>
