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

import axios from 'axios';

interface DiscoveryOperator {
  getServiceListenerList(params: KubePaginationRequest): Promise<KubePaginationResponse<any[]>>;
}

export class ServiceDiscovery implements DiscoveryOperator {
  constructor(sd?: { [key: string]: any }) {
    Object.assign(this, sd);
  }

  serviceName: string;
  groupName?: string = 'DEFAULT_GROUP';
  namespaceId?: string;
  protectThreshold?: number = 0;
  metadata?: string;
  selector?: { [key: string]: any };
  [others: string]: any;

  public async getServiceList(
    tenant: string,
    project: string,
    environment: string,
    params: KubePaginationRequest,
  ): Promise<{ count: number; serviceList: ServiceDiscovery[] }> {
    const data: { [key: string]: any } = await axios(
      `sreg/tenant/${tenant}/project/${project}/environment/${environment}`,
      {
        params: params,
      },
    );
    return data as { count: number; serviceList: ServiceDiscovery[] };
  }

  public async getService(
    tenant: string,
    project: string,
    environment: string,
    params: KubeRequest,
  ): Promise<ServiceDiscovery> {
    const data: { [key: string]: any } = await axios(
      `sreg/tenant/${tenant}/project/${project}/environment/${environment}/service/${this.serviceName}`,
      {
        params: params,
      },
    );
    return data as ServiceDiscovery;
  }

  public async addService(): Promise<ServiceDiscovery> {
    const data: { [key: string]: any } = await axios.post(``, this);
    return data as ServiceDiscovery;
  }

  public async updateService(): Promise<ServiceDiscovery> {
    const data: { [key: string]: any } = await axios.put(``, this);
    return data as ServiceDiscovery;
  }

  public async deleteService(): Promise<void> {
    await axios.delete(``);
  }

  public async getServiceListenerList(params: KubePaginationRequest): Promise<KubePaginationResponse<any[]>> {
    const data: { [key: string]: any } = await axios(``, { params: params });
    return data as KubePaginationResponse<any[]>;
  }
}

interface InstanceOperator {
  beatInstance(): Promise<void>;
}

export class ServiceInstance implements InstanceOperator {
  constructor(instance?: { [key: string]: any }) {
    Object.assign(this, instance);
  }

  serviceName: string;
  groupName?: string;
  ip: string;
  port: number;
  clusterName?: string;
  namespaceId?: string;
  ephemeral?: boolean;
  weight?: number = 1;
  metadata?: string;
  enabled?: boolean = true;
  [others: string]: any;

  public async getInstanceList(
    tenant: string,
    project: string,
    environment: string,
    params: KubePaginationRequest,
  ): Promise<{ hosts: ServiceInstance[] }> {
    const data: { [key: string]: any } = await axios(
      `sreg/tenant/${tenant}/project/${project}/environment/${environment}/service/${this.serviceName}/instances`,
      { params: params },
    );
    return data as { hosts: ServiceInstance[] };
  }

  public async getInstance(
    tenant: string,
    project: string,
    environment: string,
    params: KubeRequest,
  ): Promise<ServiceInstance> {
    const data: { [key: string]: any } = await axios(
      `sreg/tenant/${tenant}/project/${project}/environment/${environment}/service/${this.serviceName}/instance`,
      { params: params },
    );
    return data as ServiceInstance;
  }

  public async addInstance(): Promise<ServiceInstance> {
    const data: { [key: string]: any } = await axios.post(``, this);
    return data as ServiceInstance;
  }

  public async updateInstance(tenant: string, project: string, environment: string): Promise<ServiceInstance> {
    const data: { [key: string]: any } = await axios.put(
      `sreg/tenant/${tenant}/project/${project}/environment/${environment}/service/${this.serviceName}/instance`,
      this,
    );
    return data as ServiceInstance;
  }

  public async deleteInstance(tenant: string, project: string, environment: string): Promise<void> {
    await axios.delete(
      `sreg/tenant/${tenant}/project/${project}/environment/${environment}/service/${this.serviceName}/instance`,
    );
  }

  //InstanceOperator
  public async beatInstance(): Promise<void> {
    await axios.put(``, this);
  }
}
