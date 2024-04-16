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

import { RouteConfig } from 'vue-router';

const prefix = 'regions/:region?/tenant/:tenant?';
const adminPrefix = 'admin';

export const paiAdmin: RouteConfig[] = [
  {
    path: ``,
    meta: {
      header: 'routerbar.pai.h_setting',
      title: 'routerbar.pai.g_cluster_setting',
      icon: 'mdi-cog',
      show: true,
    },
    redirect: { name: `${adminPrefix}-pai-cluster` },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `${prefix}/cluster`,
        name: `${adminPrefix}-pai-cluster`,
        component: () => import('./src/views/cluster/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.cluster',
          admin: true,
          icon: 'mdi-server',
          show: true,
          rootName: 'admin-pai',
          tip: 'pai_cluster',
        },
      },
      {
        path: `${prefix}/cluster/:name`,
        name: `${adminPrefix}-pai-cluster-detail`,
        component: () => import('./src/views/cluster/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.cluster',
          admin: true,
          icon: 'mdi-server',
          show: false,
          rootName: 'admin-pai',
          tip: 'pai_cluster',
        },
      },

      {
        path: `${prefix}/tenantresource`,
        name: `${adminPrefix}-pai-quota`,
        component: () => import('./src/views/tenantquota/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.quota',
          admin: true,
          icon: 'mdi-human-queue',
          show: true,
          rootName: 'admin-pai',
          tip: 'pai_quota',
        },
      },

      {
        path: `${prefix}/management/image`,
        name: `${adminPrefix}-pai-management-image`,
        component: () => import('./src/views/image/open-list.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.management_image',
          admin: true,
          icon: 'mdi-box-shadow',
          show: true,
          rootName: 'admin-pai',
          tip: 'pai_management',
        },
      },
    ],
  },
  {
    path: ``,
    meta: {
      title: 'routerbar.pai.g_setting',
      icon: 'mdi-application',
      show: true,
    },
    redirect: { name: `${adminPrefix}-pai-management-shareset` },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `${prefix}/instacne`,
        name: `${adminPrefix}-pai-instacne`,
        component: () => import('./src/views/asset/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.instance',
          admin: true,
          icon: 'mdi-expansion-card',
          show: true,
          rootName: 'admin-pai',
          tip: 'pai_instance',
        },
      },
      {
        path: `${prefix}/management/share`,
        name: `${adminPrefix}-pai-management-shareset`,
        component: () => import('./src/views/shareset/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.management_modelx',
          admin: true,
          icon: 'mdi-database',
          show: true,
          rootName: 'admin-pai',
          tip: 'pai_management',
        },
      },
      {
        path: `${prefix}/management/async-task`,
        name: `${adminPrefix}-pai-async-task`,
        component: () => import('./src/views/async-task/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.management_job',
          admin: true,
          icon: 'mdi-file-tree',
          show: true,
          rootName: 'admin-pai',
          tip: 'pai_job',
        },
      },
      {
        path: `${prefix}/priority`,
        name: `${adminPrefix}-pai-priority`,
        component: () => import('./src/views/priority/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.priority',
          admin: true,
          icon: 'mdi-priority-high',
          show: true,
          rootName: 'admin-pai',
          tip: 'pai_priority',
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
    redirect: { name: `${adminPrefix}-pai-cluster` },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `${prefix}/const`,
        name: `${adminPrefix}-pai-cost-dash`,
        component: () => import('./src/views/cost/dashboard.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.cost_dash',
          admin: true,
          icon: 'mdi-view-dashboard',
          show: true,
          rootName: 'admin-pai',
          tip: 'pai_cost_dash',
        },
      },
      {
        path: `${prefix}/cost/analysis`,
        name: `${adminPrefix}-pai-cost-analysis`,
        component: () => import('./src/views/cost/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.cost_analysis',
          admin: true,
          icon: 'mdi-google-analytics',
          show: true,
          rootName: 'admin-pai',
          tip: 'pai_cost_analysis',
        },
      },
    ],
  },
];

const workspacePrefix = 'regions/:region?/tenant/:tenant?';
export const paiWorkspace: RouteConfig[] = [
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `${workspacePrefix}/overview`,
        name: 'pai-overview',
        component: () => import('./src/views/dashboard/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.dashboard',
          upToAdmin: true,
          icon: 'mdi-home',
          show: true,
          rootName: 'pai',
          tip: 'pai',
        },
      },
      {
        path: `${workspacePrefix}/catalog`,
        name: 'pai-catalog',
        component: () => import('./src/views/catalog/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.catalog',
          upToAdmin: true,
          icon: 'mdi-format-list-numbered',
          show: true,
          rootName: 'pai',
          tip: 'pai_catalog',
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `${workspacePrefix}/train`,
        name: 'pai-train',
        component: () => import('./src/views/task/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.train_task',
          upToAdmin: true,
          icon: 'mdi-function-variant',
          show: true,
          rootName: 'pai',
          tip: 'pai_train',
        },
      },
      {
        path: `${workspacePrefix}/train/:name`,
        name: 'pai-train-detail',
        component: () => import('./src/views/task/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.train_task',
          upToAdmin: true,
          icon: 'mdi-function-variant',
          show: false,
          rootName: 'pai',
          tip: 'pai_train',
        },
      },
      {
        path: `${workspacePrefix}/im`,
        name: 'pai-develop',
        component: () => import('./src/views/develop/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.develop',
          upToAdmin: true,
          icon: 'mdi-developer-board',
          show: true,
          rootName: 'pai',
          tip: 'pai_develop',
        },
      },
      {
        path: `${workspacePrefix}/im/:name`,
        name: 'pai-develop-detail',
        component: () => import('./src/views/develop/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.develop',
          upToAdmin: true,
          icon: 'mdi-developer-board',
          show: false,
          rootName: 'pai',
          tip: 'pai_develop',
        },
      },
      {
        path: `${workspacePrefix}/inference`,
        name: 'pai-inference',
        component: () => import('./src/views/inference/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.inference',
          upToAdmin: true,
          icon: 'mdi-head-snowflake-outline',
          show: true,
          rootName: 'pai',
          tip: 'pai_inference',
        },
      },
      {
        path: `${workspacePrefix}/inference/:name`,
        name: 'pai-inference-detail',
        component: () => import('./src/views/inference/detail.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.inference',
          upToAdmin: true,
          icon: 'mdi-head-snowflake-outline',
          show: false,
          rootName: 'pai',
          tip: 'pai_inference',
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `${workspacePrefix}/workspace`,
        name: 'pai-workspace',
        component: () => import('./src/views/workspace/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.workspace',
          upToAdmin: true,
          icon: 'mdi-home',
          show: true,
          rootName: 'pai',
          tip: 'pai_workspace',
        },
      },
      {
        path: `${workspacePrefix}/dataset`,
        name: 'pai-dataset',
        component: () => import('./src/views/dataset/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.dataset',
          upToAdmin: true,
          icon: 'mdi-database',
          show: true,
          rootName: 'pai',
          tip: 'pai_dataset',
        },
      },
      {
        path: `${workspacePrefix}/modelset`,
        name: 'pai-modelset',
        component: () => import('./src/views/modelset/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.modelset',
          upToAdmin: true,
          icon: 'mdi-database-lock',
          show: true,
          rootName: 'pai',
          tip: 'pai_model',
        },
      },
      {
        path: `${workspacePrefix}/code`,
        name: 'pai-code',
        component: () => import('./src/views/codeset/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.code',
          upToAdmin: true,
          icon: 'mdi-code-json',
          show: true,
          rootName: 'pai',
          tip: 'pai_code',
        },
      },
      {
        path: `${workspacePrefix}/image`,
        name: 'pai-image',
        component: () => import('./src/views/image/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.image',
          upToAdmin: true,
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
      header: 'routerbar.pai.h_async_task',
      title: 'routerbar.pai.g_async_task',
      icon: 'mdi-calendar-check',
      show: true,
    },
    redirect: { name: `pai-async-task` },
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `${workspacePrefix}/async-task`,
        name: `pai-async-task`,
        component: () => import('./src/views/async-task/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.management_job',
          upToAdmin: true,
          icon: 'mdi-file-tree',
          show: true,
          rootName: 'pai',
          tip: 'pai_job',
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
    component: () => import('@kubegems/components/layouts/Container.vue'),
    children: [
      {
        path: `${workspacePrefix}/const`,
        name: 'pai-cost-dash',
        component: () => import('./src/views/cost/dashboard.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.cost_dash',
          upToAdmin: true,
          icon: 'mdi-view-dashboard',
          show: true,
          rootName: 'pai',
          tip: 'pai_cost_dash',
        },
      },
      {
        path: `${workspacePrefix}/cost/analysis`,
        name: 'pai-cost-analysis',
        component: () => import('./src/views/cost/index.vue'),
        meta: {
          requireAuth: true,
          title: 'routerbar.pai.cost_analysis',
          upToAdmin: true,
          icon: 'mdi-google-analytics',
          show: true,
          rootName: 'pai',
          tip: 'pai_cost_analysis',
        },
      },
    ],
  },
];
