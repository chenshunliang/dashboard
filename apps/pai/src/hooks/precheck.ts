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
import { useGlobalI18n } from '@kubegems/extension/i18n';
import { useStore } from '@kubegems/extension/store';

const store = useStore();
const i18n = useGlobalI18n();

export const usePreCheck = (): boolean => {
  if (!store.getters.Tenant().TenantName) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.select_tenant'),
      color: 'warning',
    });
    return false;
  }
  if (!store.getters.Region().RegionName) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.select_region'),
      color: 'warning',
    });
    return false;
  }
  return true;
};

export const useTenantCheck = (): boolean => {
  if (!store.getters.Tenant().TenantName) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.select_tenant'),
      color: 'warning',
    });
    return false;
  }
  return true;
};

export const useRegionCheck = (): boolean => {
  if (!store.getters.Region().RegionName) {
    store.commit('SET_SNACKBAR', {
      text: i18n.t('tip.select_region'),
      color: 'warning',
    });
    return false;
  }
  return true;
};

export const useQueueCheck = (): boolean => {
  if (!store.state.pai.HasQueue) {
    return false;
  }
  return true;
};
