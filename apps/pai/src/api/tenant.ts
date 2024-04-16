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

export class JobResource {
  name: string;
  requests: { [key: string]: string } = {};
  limits: { [key: string]: string } = {};
  phase: string;
  [others: string]: any;
}

export class Tenant extends Base {
  constructor(tenant?: { [key: string]: any }) {
    super();
    Object.assign(this, tenant);
  }

  [others: string]: any;

  public async getTenantList(params: KubeRequest = {}): Promise<Tenant[]> {
    const data: { [key: string]: any } = await axios(`tenants`, {
      params: params,
    });
    return data as Tenant[];
  }

  public async getTenant(params: KubeRequest = {}): Promise<Tenant> {
    const data: { [key: string]: any } = await axios(`tenants/${this.name}`, {
      params: params,
    });
    return data as Tenant;
  }

  public async addTenant(): Promise<Tenant> {
    const data: { [key: string]: any } = await axios.post(`tenants`, this);
    return data as Tenant;
  }

  public async updateTenant(): Promise<Tenant> {
    const data: { [key: string]: any } = await axios.put(`pai/tenants/${this.name}`, this);
    return data as Tenant;
  }

  public async deleteTenant(): Promise<void> {
    await axios.delete(`pai/tenants/${this.name}`);
  }

  public async getRegionStatusInTenant(region: string, params: KubeRequest = {}): Promise<{ enabled: boolean }> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.name}/region-status/${region}`, {
      params: params,
    });
    return data as { enabled: boolean };
  }

  public async getResourceDetail(resource: string, params: KubeRequest = {}): Promise<{ jobs: JobResource[] }> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/summary/${resource}`,
      {
        params: params,
      },
    );
    return data as { jobs: JobResource[] };
  }

  public async getResource(params: KubeRequest = {}): Promise<any> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/regions/${this.region}/summary`, {
      params: params,
    });
    return data;
  }
}

export class TenantResource extends Base {
  constructor(tenant?: { [key: string]: any }) {
    super();
    Object.assign(this, tenant);
  }

  region: string;
  annotations: { [key: string]: string };
  labels: { [key: string]: string };
  status: {
    message: string;
    state: {
      status: { [key: string]: string };
    };
    [others: string]: any;
  };
  spec: {
    resources: {
      limits: { [key: string]: string };
      requests: { [key: string]: string };
    };
    [others: string]: any;
  };
  [others: string]: any;

  public async getTenantResourceList(params: KubeRequest = {}): Promise<TenantResource[]> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/tenants`, {
      params: params,
    });
    return data as TenantResource[];
  }

  public async getTenantResource(params: KubeRequest = {}): Promise<TenantResource> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/tenants/${this.name}`, {
      params: params,
    });
    return data as TenantResource;
  }

  public async addTenantResource(): Promise<TenantResource> {
    const data: { [key: string]: any } = await axios.post(`pai/regions/${this.region}/tenants`, this);
    return data as TenantResource;
  }

  public async updateTenantResource(): Promise<TenantResource> {
    const data: { [key: string]: any } = await axios.put(`pai/regions/${this.region}/tenants/${this.name}`, this);
    return data as TenantResource;
  }

  public async deleteTenantResource(): Promise<void> {
    await axios.delete(`pai/regions/${this.region}/tenants/${this.name}`);
  }
}
