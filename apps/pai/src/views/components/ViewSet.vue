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
    icon="mdi-folder"
    :title="i18nLocal.t('operate.view_c', [title])"
    :width="550"
    @reset="reset"
  >
    <template #content>
      <v-list class="pa-0">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-title>
              {{ i18nLocal.t('tip.host') }}
            </v-list-item-title>
            <v-list-item-subtitle class="mt-1">
              <div>
                {{ i18nLocal.t('tip.address') }}: {{ set.status.host }}
                <v-btn color="primary" icon small @click="openNewTab">
                  <v-icon small> mdi-open-in-new </v-icon>
                </v-btn>
              </div>
              <div>
                <v-btn class="px-0 mr-4" color="primary" small text @click="copyed('s3')">
                  {{ i18nLocal.t('tip.copy_config') }}
                </v-btn>
                <input id="s3" type="hidden" :value="mcCommand" />
                <v-btn class="px-0" color="primary" small text @click="toMinioDownloadPage">
                  {{ i18nLocal.t('tip.download_minio') }}
                </v-btn>
              </div>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <div class="mx-4 text-body-2">
          <div :style="{ color: 'rgba(0, 0, 0, 0.6)' }">{{ i18nLocal.t('tip.example') }}：</div>
          <div class="pa-2 grey lighten-3 mt-1" :style="{ borderRadius: '3px' }">
            <span class="green--text darken-1 mr-2">$</span>
            <span class="green--text darken-1 mr-1">mc</span>
            {{ cmdExample }}
            <v-btn class="float-right mt-n1" color="primary" icon small @click="copyed('ls')">
              <v-icon small> mdi-content-copy </v-icon>
            </v-btn>
            <input id="ls" type="hidden" :value="`mc ${cmdExample}`" />
          </div>
        </div>
        <v-divider class="my-3 mx-4" />
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-title>
              {{ i18nLocal.t('tip.cret') }}
              <v-btn color="primary" icon small @click="state.showPwd = !state.showPwd">
                <v-icon small>{{ state.showPwd ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
              </v-btn>
            </v-list-item-title>
            <v-list-item-subtitle class="mt-1">
              <div>
                {{ i18nLocal.t('tip.username') }}: {{ set.status.username }}
                <v-btn color="primary" icon small @click="copyed('username')">
                  <v-icon small> mdi-content-copy </v-icon>
                </v-btn>
                <input id="username" type="hidden" :value="set.status.username" />
              </div>
              <div>
                {{ i18nLocal.t('tip.password') }}: {{ state.showPwd ? set.status.password : '****************' }}
                <v-btn color="primary" icon small @click="copyed('password')">
                  <v-icon small> mdi-content-copy </v-icon>
                </v-btn>
                <input id="password" type="hidden" :value="set.status.password" />
              </div>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { useStore } from '@kubegems/extension/store';
  import { ComputedRef, computed, reactive, ref } from 'vue';

  import { SetBase } from '../../api/base';
  import { useI18n } from './i18n';

  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    showPwd: false,
  });

  const reset = () => {
    state.dialog = false;
  };

  const open = (): void => {
    state.dialog = true;
  };

  const title = ref('');
  const set = ref<SetBase>(new SetBase());
  const init = (item: SetBase, _title: string): void => {
    set.value = item;
    title.value = _title;
  };

  const cmdExample: ComputedRef<string> = computed(() => {
    return `ls ${set.value.name}/${set.value.status.bucket}`;
  });

  const mcCommand: ComputedRef<string> = computed(() => {
    return `mc alias set ${set.value.name} ${set.value.status.host} ${set.value.status.username} ${set.value.status.password} --api "s3v4" --path "auto"`;
  });

  const openNewTab = () => {
    window.open(`${set.value.status.host}`);
  };

  const copyed = async (id: string): Promise<void> => {
    let text = (document.getElementById(id) as HTMLInputElement).value;
    await navigator.clipboard?.writeText(text);
    store.commit('SET_SNACKBAR', {
      text: i18nLocal.t('tip.copyed'),
      color: 'success',
    });
  };

  const toMinioDownloadPage = () => {
    window.open(`https://min.io/docs/minio/linux/reference/minio-mc.html#id2`);
  };

  defineExpose({
    open,
    init,
  });
</script>

<style lang="scss" scoped>
  .v-list--two-line .v-list-item,
  .v-list-item--two-line {
    min-height: 48px;
  }
</style>
