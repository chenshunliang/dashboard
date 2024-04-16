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

export class VisualConfig extends Base {
  constructor(visual?: { [key: string]: any }) {
    super();
    Object.assign(this, visual);
  }

  namespace: string;
  job: string;
  paused = false;
  tensorboard?: {
    logdir?: string;
    image?: string;
    command?: string[];
    port?: number;
    pvc?: {
      mountPath: string;
      name: string;
    };
    [others: string]: any;
  };
  portExposure?: {
    selector?: { [key: string]: string };
    ports?: { name?: string; port: number }[];
  };
  labels?: { [key: string]: string } = {};
  status?: {
    status?: string;
    message?: string;
    tensorboard: {
      host?: string;
    };
    portExposure: {
      portStates: {
        name: string;
        port: number;
        url: string;
      }[];
    };
    [others: string]: any;
  };
  [others: string]: any;

  public async getVisualConfigList(params: KubePaginationRequest): Promise<KubePaginationResponse<VisualConfig[]>> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/regions/${this.region}/visualconfig`, {
      params: params,
    });
    return data as KubePaginationResponse<VisualConfig[]>;
  }

  public async getVisualConfig(params: KubeRequest = {}): Promise<VisualConfig> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/visualconfig/${this.name}`,
      {
        params: params,
      },
    );
    return data as VisualConfig;
  }

  public async addVisualConfig(): Promise<VisualConfig> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/visualconfig`,
      this,
    );
    return data as VisualConfig;
  }

  public async updateVisualConfig(): Promise<VisualConfig> {
    const data: { [key: string]: any } = await axios.put(
      `pai/tenants/${this.tenant}/regions/${this.region}/visualconfig/${this.name}`,
      this,
    );
    return data as VisualConfig;
  }

  public async deleteVisualConfig(): Promise<void> {
    await axios.delete(`pai/tenants/${this.tenant}/regions/${this.region}/visualconfig/${this.name}`);
  }
}
