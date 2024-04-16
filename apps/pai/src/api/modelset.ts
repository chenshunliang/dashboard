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

import { SetBase } from './base';

export class PublishInfo {
  constructor(info?: { [key: string]: any }) {
    Object.assign(this, info);
  }
  description: string;
  name: string;
  taskType: string;
  framework: string;
  version: string;
  inferenceImage: string;
  mountPath: string;
  request: {
    cpu: string;
    memory: string;
    'nvidia.com/gpu': string;
  } = {
    cpu: '',
    memory: '',
    'nvidia.com/gpu': '',
  };

  [others: string]: any;
}

export class Modelset extends SetBase {
  constructor(modelset?: { [key: string]: any }) {
    super();
    Object.assign(this, modelset);
    this.kind = 'modelset';
  }

  [others: string]: any;

  public static toClassName(): string {
    return 'modelset';
  }

  public async getPublicModelsetList(params: KubePaginationRequest): Promise<KubePaginationResponse<Modelset[]>> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/modelsets`, {
      params: params,
    });
    return data as KubePaginationResponse<Modelset[]>;
  }

  public async getPublicModelset(params: KubeRequest = {}): Promise<Modelset> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/modelsets/${this.name}`, {
      params: params,
    });
    return data as Modelset;
  }

  public async getModelsetListByAdmin(params: KubePaginationRequest): Promise<KubePaginationResponse<Modelset[]>> {
    const data: { [key: string]: any } = await axios(`pai/modelsets`, {
      params: params,
    });
    return data as KubePaginationResponse<Modelset[]>;
  }

  public async getModelsetByAdmin(params: KubeRequest = {}): Promise<Modelset> {
    const data: { [key: string]: any } = await axios(`pai/modelsets/${this.name}`, {
      params: params,
    });
    return data as Modelset;
  }

  public async addModelsetByAdmin(): Promise<Modelset> {
    const data: { [key: string]: any } = await axios.post(`pai/modelsets`, this);
    return data as Modelset;
  }

  public async updateModelsetByAdmin(): Promise<Modelset> {
    const data: { [key: string]: any } = await axios.put(`pai/modelsets/${this.name}`, this);
    return data as Modelset;
  }

  public async deleteModelsetByAdmin(): Promise<void> {
    await axios.delete(`pai/modelsets/${this.name}`);
  }

  public async getModelsetList(params: KubePaginationRequest): Promise<KubePaginationResponse<Modelset[]>> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/regions/${this.region}/modelsets`, {
      params: params,
    });
    return data as KubePaginationResponse<Modelset[]>;
  }

  public async getModelset(params: KubeRequest = {}): Promise<Modelset> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/modelsets/${this.name}`,
      {
        params: params,
      },
    );
    return data as Modelset;
  }

  public async addModelset(): Promise<Modelset> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/modelsets`,
      this,
    );
    return data as Modelset;
  }

  public async updateModelset(): Promise<Modelset> {
    const data: { [key: string]: any } = await axios.put(
      `pai/tenants/${this.tenant}/regions/${this.region}/modelsets/${this.name}`,
      this,
    );
    return data as Modelset;
  }

  public async deleteModelset(): Promise<void> {
    await axios.delete(`pai/tenants/${this.tenant}/regions/${this.region}/modelsets/${this.name}`);
  }

  public async reCacheModelsetByAdmin(): Promise<Modelset> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/modelsets/${this.name}:recache`,
      this,
    );
    return data as Modelset;
  }
}
