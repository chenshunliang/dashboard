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
import { convertResponse2Pagination } from '@/types/base';
import { ServiceDiscovery, ServiceInstance } from '@/types/nacos';

export const useServiceDiscoveryList = async (
  sd: ServiceDiscovery,
  tenant: string,
  project: string,
  environment: string,
  page = 1,
  size = 10,
  request: KubeRequest = {},
): Promise<Pagination<ServiceDiscovery>> => {
  const _data = await sd.getServiceList(tenant, project, environment, {
    page: page,
    size: size,
    ...request,
  });
  return {
    items: _data.serviceList,
    page: page,
    size: size,
    total: _data.count,
    pageCount: Math.ceil((_data?.count || 0) / (page || 1)),
  } as Pagination<ServiceDiscovery>;
};

export const useServiceInstanceList = async (
  instance: ServiceInstance,
  tenant: string,
  project: string,
  environment: string,
  page = 1,
  size = 10,
  request: KubeRequest = {},
): Promise<Pagination<ServiceInstance>> => {
  const _data = await instance.getInstanceList(tenant, project, environment, {
    page: page,
    size: size,
    ...request,
  });
  return {
    items: _data.hosts,
    page: page,
    size: size,
    total: _data.hosts?.length,
    pageCount: Math.ceil((_data.hosts?.length || 0) / (page || 1)),
  } as Pagination<ServiceInstance>;
};
