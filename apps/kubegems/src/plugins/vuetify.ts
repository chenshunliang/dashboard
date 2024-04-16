/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useStore } from '@kubegems/extension/store';
import config from '@kubegems/libs/constants/global';
import Vue from 'vue';
import Vuetify from 'vuetify';

import '@/scss/vuetify/overrides.scss';

const store = useStore();

Vue.use(Vuetify);

const theme: { [key: string]: string } = config.theme.THEME_COLOR;
if (store.state.ThemeColor) {
  theme.primary = store.state.ThemeColor;
}

export default new Vuetify({
  theme: {
    themes: {
      light: theme,
    },
  },
});
