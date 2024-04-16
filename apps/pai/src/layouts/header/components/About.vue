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
  <v-dialog v-model="state.dialog" height="100%" :max-width="700" persistent scrollable>
    <v-card>
      <v-card-text class="pa-0">
        <div>
          <v-img class="ma-2" contain :src="config.layout.LOGO_PRIMARY" width="200" />
          <div class="kubegems__clear-float" />
        </div>
        <v-divider />
        <h6 class="text-subtitle-2 ma-4 font-weight-medium">
          {{ i18n.t('metadata.description') }}
        </h6>

        <v-flex v-for="(value, key) in version" :key="key" class="mx-4">
          <h6 class="text-body-2 grey--text text--darken-1 font-weight-regular"> {{ cnDict[key] }} : {{ value }} </h6>
        </v-flex>
      </v-card-text>
      <v-divider class="mt-4" />
      <v-card-title class="text-body-2 kubegems__text px-4">
        <div class="title__pointer mr-1" :style="{ fontWeight: 500 }" @click.stop="toOpenProtocol">
          <a class="float-left title__div kubegems__text">
            <BaseLogo icon-name="apache" :ml="0" :width="18" />
            {{ i18nLocal.t('tip.openresource') }}
          </a>
        </div>

        <div class="title__pointer" @click.stop="toProject">
          <v-btn class="float-left" icon small>
            <v-icon>mdi-github</v-icon>
          </v-btn>
          <div class="float-left title__div"> {{ i18nLocal.t('tip.project_address') }} </div>
        </div>

        <div class="ml-2 title__pointer" @click.stop="toIssue">
          <v-btn class="float-left" color="red lighten-1" icon small>
            <v-icon>mdi-bug</v-icon>
          </v-btn>
          <div class="float-left title__div"> {{ i18nLocal.t('tip.issue') }} </div>
        </div>

        <v-spacer />

        <div class="ml-2 title__pointer" @click.stop="toStar">
          <v-btn class="float-left" color="orange" icon small>
            <v-icon>mdi-star</v-icon>
          </v-btn>
          <div class="float-left title__div"> {{ i18nLocal.t('tip.star') }} </div>
        </div>
      </v-card-title>
      <div class="pa-2">
        <v-btn class="float-right" color="error" small text @click="state.dialog = false">
          {{ i18n.t('operate.close') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { Version } from '@kubegems/api/typed/version';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import config from '@kubegems/libs/constants/global';
  import moment from 'moment';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../i18n';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const router = useRouter();

  const state = reactive({
    dialog: false,
  });

  const cnDict: { [key: string]: any } = {
    version: i18nLocal.t('about.dashboard_version'),
    date: i18nLocal.t('about.dashboard_release_time'),
    GitVersion: i18nLocal.t('about.api_version'),
    GitCommit: 'Commit',
    BuildDate: i18nLocal.t('about.api_release_time'),
    GoVersion: i18nLocal.t('about.go_version'),
    Compiler: i18nLocal.t('about.compile'),
    Platform: i18nLocal.t('about.compile_platform'),
    timezone: i18nLocal.t('about.timezone'),
  };

  const open = (): void => {
    state.dialog = true;
  };

  const version = ref<Version>(new Version());
  const init = async (): Promise<void> => {
    const data = await new Version().getVersion({ noprocessing: true });
    version.value = Object.assign(data, {
      version: (import.meta as any).env.VUE_APP_RELEASE,
      date: (import.meta as any).env.VUE_APP_DATE ? moment((import.meta as any).env.VUE_APP_DATE).format('lll') : '',
      timezone: `${Intl.DateTimeFormat().resolvedOptions().timeZone} UTC+${0 - new Date().getTimezoneOffset() / 60}`,
    });
  };

  const toProject = (): void => {
    window.open('https://github.com/kubegems/kubegems');
  };
  const toIssue = (): void => {
    window.open('https://github.com/kubegems/kubegems/issues');
  };
  const toStar = (): void => {
    window.open('https://github.com/kubegems/kubegems');
  };
  const toOpenProtocol = (): void => {
    window.open(router.resolve({ name: 'clincense' }).href);
  };

  defineExpose({
    init,
    open,
  });
</script>

<style lang="scss" scoped>
  .v-list-item--dense,
  .v-list--dense .v-list-item {
    min-height: 30px;
  }

  .title {
    &__div {
      line-height: 28px;
    }

    &__pointer {
      cursor: pointer;
    }
  }
</style>
