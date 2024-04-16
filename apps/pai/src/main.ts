/*
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
 */

import i18n from '@kubegems/extension/i18n';
import { useStore } from '@kubegems/extension/store';
import Vue from 'vue';

import App from './App.vue';
import '@kubegems/extension/icon';
import './plugins/base';
import vuetify from './plugins/vuetify';
import router from './router';

import '@kubegems/extension/tool';

import './assets/styles/index.scss';
import '@kubegems/api/response';
import './request';
import './store';

const store = useStore();

Vue.config.productionTip = false;

const timeout: NodeJS.Timeout = setTimeout((): void => {
  // eslint-disable-next-line vue/require-name-property
  new Vue({
    vuetify,
    store,
    router,
    i18n,
    render: (h) => h(App),
  }).$mount('#app');
  clearTimeout(timeout);
}, 0);
