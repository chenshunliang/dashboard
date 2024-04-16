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
import { useRouter } from '@kubegems/extension/router';
import { useStore } from '@kubegems/extension/store';
import { ActionContext } from 'vuex';

import { Region } from './api/region';
import { Tenant } from './api/tenant';

const store = useStore();
const router = useRouter();
const RegionStore = 'regionStore';
const HasQueue = 'hasQueue';

const useRegion = async (): Promise<Region[]> => {
  const data = await new Region().getRegionList({ page: 1, size: 1000, noprocessing: true });
  return data;
};

const useQueueInTenant = async (region: string) => {
  if (!region) return;
  if (!store.getters.Tenant().TenantName) return;
  const data = await new Tenant({ name: store.getters.Tenant().TenantName }).getRegionStatusInTenant(region, {
    noprocessing: true,
  });
  store.commit('SET_QUEUE', data.enabled);
};

store.registerModule('pai', {
  state: {
    RegionStore: JSON.parse(window.localStorage.getItem(RegionStore) as string) || [],
    HasQueue: [true, 'true'].includes(window.localStorage.getItem(HasQueue) as string),
  },
  mutations: {
    SET_REGION(state: { [key: string]: any }, payload: { [key: string]: string | number }[]): void {
      state.RegionStore = payload;
      window.localStorage.setItem(RegionStore, JSON.stringify(payload));
    },
    SET_QUEUE(state: { [key: string]: any }, payload: { [key: string]: string | number }[]): void {
      state.HasQueue = payload;
      window.localStorage.setItem(HasQueue, JSON.stringify(payload));
    },
  },
  actions: {
    async UPDATE_REGION_DATA({
      commit,
    }: ActionContext<
      {
        [key: string]: any;
      },
      {
        [key: string]: any;
      }
    >): Promise<void> {
      const data: { [key: string]: string | number }[] = await useRegion();
      commit('SET_REGION', data);
    },
    async UPDATE_QUEUE_STATUS_DATA({
      getters,
    }: ActionContext<
      {
        [key: string]: any;
      },
      {
        [key: string]: any;
      }
    >): Promise<void> {
      useQueueInTenant(getters.Region().RegionName);
    },
  },
  getters: {
    Region: (state) => (): { [key: string]: string | number } => {
      const _store: { [key: string]: string | number }[] = state.RegionStore;
      let region: string = window.location.pathname.split('/')[5];
      if (router) {
        region = router.currentRoute.params.region;
      }
      if (region) {
        const reg = _store.find((v) => {
          return v.name === region;
        });
        if (reg) {
          return { RegionName: reg.name, ClusterName: reg.clusterName };
        }
        return {
          RegionName: void 0,
          ClusterName: void 0,
        };
      }
      const _region = _store.length > 0 ? _store[0] : void 0;
      return {
        RegionName: _region?.name,
        ClusterName: _region?.clusterName,
      };
    },
  },
});
