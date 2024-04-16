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
export class Dataset extends SetBase {
  constructor(dataset?: { [key: string]: any }) {
    super();
    Object.assign(this, dataset);
    this.kind = 'dataset';
  }

  [others: string]: any;

  public static toClassName(): string {
    return 'dataset';
  }

  public async getPublicDatasetList(params: KubePaginationRequest): Promise<KubePaginationResponse<Dataset[]>> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/datasets`, {
      params: params,
    });
    return data as KubePaginationResponse<Dataset[]>;
  }

  public async getPublicDataset(params: KubeRequest = {}): Promise<Dataset> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/datasets/${this.name}`, {
      params: params,
    });
    return data as Dataset;
  }

  public async getDatasetListByAdmin(params: KubePaginationRequest): Promise<KubePaginationResponse<Dataset[]>> {
    const data: { [key: string]: any } = await axios(`pai/datasets`, {
      params: params,
    });
    return data as KubePaginationResponse<Dataset[]>;
  }

  public async getDatasetByAdmin(params: KubeRequest = {}): Promise<Dataset> {
    const data: { [key: string]: any } = await axios(`pai/datasets/${this.name}`, {
      params: params,
    });
    return data as Dataset;
  }

  public async addDatasetByAdmin(): Promise<Dataset> {
    const data: { [key: string]: any } = await axios.post(`pai/datasets`, this);
    return data as Dataset;
  }

  public async updateDatasetByAdmin(): Promise<Dataset> {
    const data: { [key: string]: any } = await axios.put(`pai/datasets/${this.name}`, this);
    return data as Dataset;
  }

  public async deleteDatasetByAdmin(): Promise<void> {
    await axios.delete(`pai/datasets/${this.name}`);
  }

  public async getDatasetList(params: KubePaginationRequest): Promise<KubePaginationResponse<Dataset[]>> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/regions/${this.region}/datasets`, {
      params: params,
    });
    return data as KubePaginationResponse<Dataset[]>;
  }

  public async getDataset(params: KubeRequest = {}): Promise<Dataset> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/datasets/${this.name}`,
      {
        params: params,
      },
    );
    return data as Dataset;
  }

  public async addDataset(): Promise<Dataset> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/datasets`,
      this,
    );
    return data as Dataset;
  }

  public async updateDataset(): Promise<Dataset> {
    const data: { [key: string]: any } = await axios.put(
      `pai/tenants/${this.tenant}/regions/${this.region}/datasets/${this.name}`,
      this,
    );
    return data as Dataset;
  }

  public async deleteDataset(): Promise<void> {
    await axios.delete(`pai/tenants/${this.tenant}/regions/${this.region}/datasets/${this.name}`);
  }

  public async reCacheDatasetByAdmin(): Promise<Dataset> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/datasets/${this.name}:recache`,
      this,
    );
    return data as Dataset;
  }
}
