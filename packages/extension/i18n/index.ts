/*
 * xiaoshi
 * Copyright (C) 2024  xiaoshiai.cn
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
// Imports
import Vue from 'vue';
import VueI18n from 'vue-i18n';

import { useStore } from '../store';
// Messages
import * as en from './en.json';
import * as ja from './ja.json';
import l from './locales';
import * as zhHans from './zh-Hans.json';
import * as zhHant from './zh-Hant.json';

Vue.use(VueI18n);

const store = useStore();

const i18n = new VueI18n({
  locale: store.state.Locale || 'zh-Hans',
  fallbackLocale: store.state.Locale || 'zh-Hans',
  messages: { ['zh-Hans']: zhHans, en, ja, ['zh-Hant']: zhHant },
});

export const useGlobalI18n = () => i18n;

export const locales = l;

export default i18n;
