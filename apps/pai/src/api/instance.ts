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

export class SkuResource {
  constructor(resource?: { [key: string]: any }) {
    Object.assign(this, resource);
  }

  name = '';
  resourceName: string;
  resourceQuantity: string;
  labels: { [key: string]: string };
  onSale?: boolean;
  [others: string]: any;
}

export class SkuConfig {
  constructor(config?: { [key: string]: any }) {
    Object.assign(this, config);
  }

  flops = 0;
  accelerator: string;
  price = 0;
}

export class Instance extends Base {
  constructor(instance?: { [key: string]: any }) {
    super();
    Object.assign(this, instance);
  }

  config: SkuConfig = new SkuConfig();
  region: string;
  enabled = false;
  resources: SkuResource[] = [];
  [others: string]: any;

  public async getInstanceList(params: KubePaginationRequest): Promise<KubePaginationResponse<Instance[]>> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/skus`, { params: params });
    return data as KubePaginationResponse<Instance[]>;
  }

  public async getInstance(params: KubeRequest = {}): Promise<Instance> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/skus/${this.name}`, {
      params: params,
    });
    return data as Instance;
  }

  public async addInstance(): Promise<Instance> {
    const data: { [key: string]: any } = await axios.post(`pai/regions/${this.region}/skus`, this);
    return data as Instance;
  }

  public async updateInstance(): Promise<Instance> {
    const data: { [key: string]: any } = await axios.put(`pai/regions/${this.region}/skus/${this.name}`, this);
    return data as Instance;
  }

  public async deleteInstance(): Promise<void> {
    await axios.delete(`pai/regions/${this.region}/skus/${this.name}`);
  }

  public async getInstanceResourceList(
    params: KubeRequest = {},
  ): Promise<{ cpu: SkuResource[]; gpu: SkuResource[]; sgpu: SkuResource[] }> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/sku-resources`, { params: params });
    return data as { cpu: SkuResource[]; gpu: SkuResource[]; sgpu: SkuResource[] };
  }

  public async getInstanceInfoList(params: KubeRequest = {}): Promise<Instance[]> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/sku-infos`, { params: params });
    return data as Instance[];
  }

  public async getInstanceInfoListByTenant(tenant: string, params: KubeRequest = {}): Promise<Instance[]> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${tenant}/regions/${this.region}/sku-infos`, {
      params: params,
    });
    return data as Instance[];
  }
}
