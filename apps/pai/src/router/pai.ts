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

import { RouteConfig } from 'vue-router';

const prefix = 'regions/:region?';

export const pai: RouteConfig[] = [
  {
    path: '/admin-pai',
    name: 'pai',
    component: () => import('@/layouts/Layout.vue'),
    redirect: { name: 'pai-overview' },
    children: [
      // overview
      {
        path: '',
        meta: {
          header: 'routerbar.pai.h_dashboard',
          title: 'routerbar.pai.g_dashboard',
          icon: 'mdi-view-dashboard',
          show: true,
        },
        redirect: { name: 'pai-overview' },
        component: () => import('@/layouts/Container.vue'),
        children: [
          {
            path: `${prefix}/overview`,
            name: 'pai-overview',
            component: () => import('@/views/dashboard/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.dashboard',
              admin: true,
              icon: 'mdi-home',
              show: true,
              rootName: 'pai',
              tip: 'pai',
            },
          },
        ],
      },
      {
        path: ``,
        meta: {
          header: 'routerbar.pai.h_task',
          title: 'routerbar.pai.g_task',
          icon: 'mdi-file-tree',
          show: true,
        },
        redirect: { name: 'pai-train' },
        component: () => import('@/layouts/Container.vue'),
        children: [
          {
            path: `${prefix}/train`,
            name: 'pai-train',
            component: () => import('@/views/task/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.train_task',
              admin: true,
              icon: 'mdi-function-variant',
              show: true,
              rootName: 'pai',
              tip: 'pai_train',
            },
          },
          {
            path: `${prefix}/train/:name`,
            name: 'pai-train-detail',
            component: () => import('@/views/task/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.train_task',
              admin: true,
              icon: 'mdi-function-variant',
              show: false,
              rootName: 'pai',
              tip: 'pai_train',
            },
          },
          {
            path: `${prefix}/develop`,
            name: 'pai-develop',
            component: () => import('@/views/develop/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.develop',
              admin: true,
              icon: 'mdi-developer-board',
              show: true,
              rootName: 'pai',
              tip: 'pai_develop',
            },
          },
        ],
      },
      {
        path: ``,
        meta: {
          header: 'routerbar.pai.h_asset',
          title: 'routerbar.pai.g_ai_asset',
          icon: 'mdi-sitemap',
          show: false,
        },
        redirect: { name: 'pai-cluster' },
        component: () => import('@/layouts/Container.vue'),
        children: [
          {
            path: `${prefix}/dataset`,
            name: 'pai-dataset',
            component: () => import('@/views/dataset/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.dataset',
              admin: true,
              icon: 'mdi-database',
              show: true,
              rootName: 'pai',
              tip: 'pai_dataset',
            },
          },
          {
            path: `${prefix}/modelset`,
            name: 'pai-modelset',
            component: () => import('@/views/modelset/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.modelset',
              admin: true,
              icon: 'mdi-database-lock',
              show: true,
              rootName: 'pai',
              tip: 'pai_model',
            },
          },
          {
            path: `${prefix}/code`,
            name: 'pai-code',
            component: () => import('@/views/codeset/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.code',
              admin: true,
              icon: 'mdi-code-json',
              show: true,
              rootName: 'pai',
              tip: 'pai_code',
            },
          },
          {
            path: `${prefix}/workspace`,
            name: 'pai-workspace',
            component: () => import('@/views/workspace/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.workspace',
              admin: true,
              icon: 'mdi-home',
              show: true,
              rootName: 'pai',
              tip: 'pai_workspace',
            },
          },
          {
            path: `${prefix}/image`,
            name: 'pai-image',
            component: () => import('@/views/image/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.image',
              admin: true,
              icon: 'mdi-box-shadow',
              show: true,
              rootName: 'pai',
              tip: 'pai_image',
            },
          },
        ],
      },
      {
        path: ``,
        meta: {
          title: 'routerbar.pai.g_setting',
          icon: 'mdi-application',
          show: false,
        },
        redirect: { name: 'pai-cluster' },
        component: () => import('@/layouts/Container.vue'),
        children: [
          {
            path: `${prefix}/cluster`,
            name: 'pai-cluster',
            component: () => import('@/views/cluster/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.cluster',
              admin: true,
              icon: 'mdi-server',
              show: true,
              rootName: 'pai',
              tip: 'pai_cluster',
            },
          },
          {
            path: `${prefix}/cluster/:name`,
            name: 'pai-cluster-detail',
            component: () => import('@/views/cluster/detail.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.cluster',
              admin: true,
              icon: 'mdi-server',
              show: false,
              rootName: 'pai',
              tip: 'pai_cluster',
            },
          },
          {
            path: `${prefix}/instacne`,
            name: 'pai-instacne',
            component: () => import('@/views/asset/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.instance',
              admin: true,
              icon: 'mdi-expansion-card',
              show: true,
              rootName: 'pai',
              tip: 'pai_instance',
            },
          },
        ],
      },
      {
        path: ``,
        meta: {
          header: 'routerbar.pai.h_cost',
          title: 'routerbar.pai.g_cost',
          icon: 'mdi-currency-usd',
          show: false,
        },
        redirect: { name: 'pai-cluster' },
        component: () => import('@/layouts/Container.vue'),
        children: [
          {
            path: `${prefix}/const`,
            name: 'pai-cost-dash',
            component: () => import('@/views/cost/dashboard.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.cost_dash',
              admin: true,
              icon: 'mdi-view-dashboard',
              show: true,
              rootName: 'pai',
              tip: 'pai_cost_dash',
            },
          },
          {
            path: `${prefix}/cost/analysis`,
            name: 'pai-cost-analysis',
            component: () => import('@/views/cost/index.vue'),
            meta: {
              requireAuth: true,
              title: 'routerbar.pai.cost_analysis',
              admin: true,
              icon: 'mdi-google-analytics',
              show: true,
              rootName: 'pai',
              tip: 'pai_cost_analysis',
            },
          },
        ],
      },
    ],
  },
];
