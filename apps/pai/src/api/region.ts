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
import axios from 'axios';

import { Base } from './base';
import { Tenant } from './tenant';

interface TenantInRegion {
  getTenantListInRegion(params: KubeRequest): Promise<Tenant[]>;
  addTenantInRegion(): Promise<Tenant>;
  updateTenantInRegion(tenant: Tenant): Promise<Tenant>;
  deleteTenantInRegion(tenant: Tenant): Promise<void>;
}

class UsageStatus {
  constructor(status?: { [key: string]: any }) {
    Object.assign(this, status);
  }

  [others: string]: any;
}

class ResourceUsage {
  constructor(info?: { [key: string]: any }) {
    Object.assign(this, info);
  }

  name: string;
  productName: string;
  selector?: { [key: string]: string };
  total: string;
  used: string;
  [others: string]: any;
}

export class NodeSummary {
  constructor(node?: { [key: string]: any }) {
    Object.assign(this, node);
  }

  annotations: { [key: string]: any } = {};
  name: string;
  phase: string;
  usage: UsageStatus[];
  resources: {
    cpu: ResourceUsage;
    gpu: ResourceUsage;
    'nvidia.com/gpu'?: ResourceUsage;
    [others: string]: any;
  };
  [others: string]: any;
}

export class NodePod {
  constructor(pod?: { [key: string]: any }) {
    Object.assign(this, pod);
  }

  annotations: { [key: string]: string };
  createdAt: Date;
  creator: string;
  description: string;
  jobName: string;
  labels: { [key: string]: string };
  name: string;
  nodeName: string;
  preemptionPolicy: string;
  priorityClassName: string;
  queueName: string;
  roleName: string;
  skuName: string;
  tenant: string;
  updatedAt: Date;
  [others: string]: any;
}

export class Region extends Base implements TenantInRegion {
  constructor(region?: { [key: string]: any }) {
    super();
    Object.assign(this, region);
  }

  clusterName: string;
  gpuCount = 0;
  kubernetesVersion: string;
  nodes: NodeSummary[];

  rdmaNetworkAttachmentName?: string;
  rdmaNetworkCIDR?: string;
  rdmaNetworkDeviceName?: string;
  [others: string]: any;

  public async getRegionList(params: KubeRequest = {}): Promise<Region[]> {
    const data: { [key: string]: any } = await axios(`pai/regions`, { params: params });
    return data as Region[];
  }

  public async getRegion(params: KubeRequest = {}): Promise<Region> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.name}`, { params: params });
    return data as Region;
  }

  public async addRegion(): Promise<Region> {
    const data: { [key: string]: any } = await axios.post(`pai/regions`, this);
    return data as Region;
  }

  public async deleteRegion(): Promise<void> {
    await axios.delete(`pai/regions/${this.name}`);
  }

  // tenant in region
  public async getTenantListInRegion(params: KubeRequest = {}): Promise<Tenant[]> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.name}/tenants`, {
      params: params,
    });
    return data as Tenant[];
  }

  public async addTenantInRegion(): Promise<Tenant> {
    const data: { [key: string]: any } = await axios.post(`pai/regions/${this.name}/tenants`, this);
    return data as Tenant;
  }

  public async updateTenantInRegion(tenant: Tenant): Promise<Tenant> {
    const data: { [key: string]: any } = await axios.put(`pai/regions/${this.name}/tenants/${tenant.name}`, this);
    return data as Tenant;
  }

  public async deleteTenantInRegion(tenant: Tenant): Promise<void> {
    await axios.delete(`pai/regions/${this.name}/tenants/${tenant.name}`);
  }

  public async getRegionSummary(params: KubeRequest = {}): Promise<{ [key: string]: any }> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.name}/summary`, { params: params });
    return data as { [key: string]: any };
  }

  public async getRegionSummaryByResource(resource: string, params: KubeRequest = {}): Promise<any> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.name}/summary/${resource}`, {
      params: params,
    });
    return data as any;
  }

  public async getPodListByRegionNode(node: string, params: KubeRequest = {}): Promise<NodePod[]> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.name}/nodes/${node}/pods`, {
      params: params,
    });
    return data as NodePod[];
  }

  public async getRegionCapacity(params: KubeRequest = {}): Promise<{ [key: string]: any }> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.name}/capacity`, { params: params });
    return data as { [key: string]: any };
  }
}
