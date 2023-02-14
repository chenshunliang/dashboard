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
import { Environment } from '@/types/environment';
import { Project } from '@/types/project';
import { Tenant } from '@/types/tenant';
import { User } from '@/types/user';
import { sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

export const useTenantList = async (tenant: Tenant): Promise<Tenant[]> => {
  const _data: KubePaginationResponse<Tenant[]> = await tenant.getTenantList({
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return _data.List as Tenant[];
};

export const useProjectListInTenant = async (tenant: Tenant): Promise<Project[]> => {
  const _data: KubePaginationResponse<Project[]> = await tenant.getProjectList({
    page: 1,
    size: 1000,
    noprocessing: true,
    preload: 'Cluster',
  });
  return _data.List as Project[];
};

export const useEnvironmentListInTenant = async (tenant: Tenant): Promise<Environment[]> => {
  const _data: KubePaginationResponse<Environment[]> = await tenant.getEnvironmentList({
    page: 1,
    size: 1000,
    noprocessing: true,
    preload: 'Cluster,Project',
  });
  return _data.List as Environment[];
};

export const useTenantUserList = async (tenant: Tenant): Promise<User[]> => {
  const _data: KubePaginationResponse<User[]> = await tenant.getUserList({
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return _data.List as User[];
};

export const useTenantUserPagination = async (tenant: Tenant, page = 1, size = 10): Promise<Pagination<User>> => {
  const _data: KubePaginationResponse<User[]> = await tenant.getUserList({
    page: page,
    size: size,
    noprocessing: true,
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
    total: _data.Total,
  } as Pagination<User>;
};

export const useTenantPagination = async (
  tenant: Tenant,
  page = 1,
  size = 10,
  search = '',
  request: KubeRequest = {},
): Promise<Pagination<Tenant>> => {
  const _data: KubePaginationResponse<Tenant[]> = await tenant.getTenantList({
    page: page,
    size: size,
    search: search,
    ...request,
  });

  _data.List.forEach((t: Tenant) => {
    t.Cpu = 0;
    t.Memory = 0;
    t.Storage = 0;
    t.ResourceQuotas.forEach((r) => {
      if (!r.Content['limits.storage']) {
        r.Content['limits.storage'] = r.Content['requests.storage'];
      }

      t.Cpu += sizeOfCpu(r.Content['limits.cpu']);
      t.Memory += sizeOfStorage(r.Content['limits.memory']);
      t.Storage += sizeOfStorage(r.Content['limits.storage']);
    });

    if (t.AllocatedResourcequota && !t.AllocatedResourcequota['limits.storage']) {
      t.AllocatedResourcequota['limits.storage'] = t.AllocatedResourcequota['requests.storage'];
    }

    t.AllocatedCpu = t.AllocatedResourcequota ? sizeOfCpu(t.AllocatedResourcequota['requests.cpu']) : 0;
    t.AllocatedMemory = t.AllocatedResourcequota ? sizeOfStorage(t.AllocatedResourcequota['requests.memory']) : 0;
    t.AllocatedStorage = t.AllocatedResourcequota ? sizeOfStorage(t.AllocatedResourcequota['limits.storage']) : 0;

    t.CpuPercentage = t.Cpu > 0 ? ((t.AllocatedCpu / t.Cpu) * 100).toFixed(1) : 0;
    t.MemoryPercentage = t.Memory > 0 ? ((t.AllocatedMemory / t.Memory) * 100).toFixed(1) : 0;
    t.StoragePercentage = t.Storage > 0 ? ((t.AllocatedStorage / t.Storage) * 100).toFixed(1) : 0;
  });

  return {
    items: _data.List,
    pageCount: Math.ceil(_data.Total / _data.CurrentSize),
    page: _data.CurrentPage,
    size: _data.CurrentSize,
  } as Pagination<Tenant>;
};
