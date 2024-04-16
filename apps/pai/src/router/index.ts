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
import { useRouter } from '@kubegems/extension/router';
import config from '@kubegems/libs/constants/global';
import { platform } from '@kubegems/platform/router';

import { global } from './global';
import { pai } from './pai';

const router = useRouter();
const i18n = useGlobalI18n();

const management = [
  {
    path: '/management',
    name: 'management',
    component: () => import('@/layouts/Layout.vue'),
    redirect: { name: 'tenant-list' },
    children: platform,
  },
];

const originalRoutes = global.concat(management).concat(pai);

const rs = router.getRoutes();
originalRoutes.forEach((r) => {
  if (
    !rs.find((rr) => {
      return rr.name === r.name;
    })
  )
    router.addRoute(r);
});

router.beforeResolve((to, from, next): void => {
  if (window) {
    window.document.title = `${i18n.t(to.meta.title)} - ${config.layout.PLATFORM}`;
  }
  next();
});

export const useRoutes = () => {
  return originalRoutes;
};

export default router;
