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
  <div class="login__third d-flex align-center" :style="{ height: `100% !important` }">
    <v-container>
      <div class="pa-7 pa-sm-12">
        <v-row>
          <v-col class="login" cols="3" lg="3" xl="3" />
          <v-col class="login" cols="6" lg="6" xl="6">
            <div class="login__content primary--text">KubeGems PAI</div>
            <h2 class="font-weight-bold mt-4 blue-grey--text text--darken-2 text-center">
              {{ i18n.t('login') }}
            </h2>
            <v-form ref="loginForm" v-model="state.valid" action="/" lazy-validation>
              <v-text-field
                v-model="obj.username"
                class="mt-4"
                :label="i18n.t('username')"
                outlined
                required
                :rules="objRules.username"
                @keyup.enter="login"
              />
              <v-text-field
                v-model="obj.password"
                :append-icon="state.show ? 'mdi-eye' : 'mdi-eye-off'"
                :counter="32"
                :label="i18n.t('passwd')"
                outlined
                required
                :rules="objRules.password"
                :type="state.show ? 'text' : 'password'"
                @click:append="state.show = !state.show"
                @keyup.enter="login"
              />

              <v-btn
                block
                class="mr-4"
                color="info"
                :disabled="!state.valid"
                :loading="store.state.Circular"
                submit
                @click="login"
              >
                {{ i18n.t('login') }}
              </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
  import { Auth } from '@kubegems/api/typed/auth';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import router from '@kubegems/extension/router';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { validateJWT } from '@kubegems/libs/utils/helpers';
  import { onMounted, reactive, ref } from 'vue';

  const store = useStore();
  const i18n = useGlobalI18n();

  const obj = ref({
    username: '',
    password: '',
    source: 'account',
  });
  const objRules = {
    username: [required],
    password: [required],
  };

  const state = reactive({
    show: false,
    valid: false,
  });

  const loginForm = ref(null);
  const login = async (): Promise<void> => {
    if (loginForm.value.validate(true)) {
      const data = await new Auth().login(obj.value);
      if (data.token) store.commit('SET_JWT', data.token);
      await loadLoginData();
      store.commit('SET_SNACKBAR', {
        text: i18n.t('status.success'),
        color: 'success',
      });
    }
  };

  const loadLoginData = async (): Promise<void> => {
    const data = await new Auth().getLoginUser();
    store.commit('SET_USER', data);
    store.commit('SET_ADMIN', data.SystemRole.RoleCode === 'sysadmin');
    store.commit('SET_ADMIN_VIEWPORT', true);
    router.push({ name: 'pai-overview', params: { region: store.getters.Region().RegionName } });
  };

  const init = async (): Promise<void> => {
    if (store.state.JWT != null && validateJWT(store.state.JWT)) {
      store.commit('SET_SNACKBAR', {
        text: i18n.t('status.logined'),
        color: 'success',
      });
      await loadLoginData();
    }
  };

  onMounted(() => {
    init();
  });
</script>

<style lang="scss" scoped>
  .login {
    &__content {
      text-align: center;
      font-size: 36px;
      font-family: 'kubegems-sample';
    }
  }
</style>
