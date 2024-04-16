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
import { Pod } from '@kubegems/api/typed/pod';
import axios from 'axios';

import { Base, SetBase } from './base';

export class Config {
  constructor(conf?: { [key: string]: any }) {
    Object.assign(this, conf);
  }

  roles: Role[] = [new Role()];
  paused?: boolean;
  priority?: string = '';
  queue?: string;
  ttl?: string = '0';
  kind = 'training';
  preempt?: boolean = false;
  rdmaEnabled?: boolean = false;
}

export class RoleStatus {
  constructor(status?: { [key: string]: any }) {
    Object.assign(this, status);
  }
  ports: Port[] = [];
  [others: string]: any;
}

export class MountSet {
  constructor(set?: { [key: string]: any }) {
    Object.assign(this, set);
  }

  kind: string;
  name: string;
  targetPath: string;
  source = '';
  [others: string]: any;
}

export class Port {
  constructor(port?: { [key: string]: any }) {
    Object.assign(this, port);
  }

  access?: {
    host?: string;
    password?: string;
    type?: string;
    username?: string;
  };
  name: string;
  port: number;
}

export class Env {
  constructor(env?: { [key: string]: any }) {
    Object.assign(this, env);
  }

  name: string;
  value: string;
  [others: string]: any;
}

export class Role {
  constructor(role?: { [key: string]: any }) {
    Object.assign(this, role);
  }

  command: string[] = [];
  env: Env[] = [];
  image: string;
  name = 'job';
  nodeSelector: { [key: string]: string } = {};
  ports: Port[] = [];
  replicas = 1;
  sku = '';
  skuDetails: any = {};
  shmSize = '0';
  volumeMountSets: MountSet[] = [];
  workingDir = '';
  [others: string]: any;
}

interface Operator {
  startJob(): Promise<Job>;
  stopJob(): Promise<Job>;
}

export class Job extends Base implements Operator {
  constructor(job?: { [key: string]: any }) {
    super();
    Object.assign(this, job);
  }

  annotations: { [key: string]: string } = {};
  config: Config = new Config();
  region: string;
  tenant: string;
  type: string;
  status: {
    state: {
      lastTransitionTime?: Date;
      phase: string;
      runningTimestamp?: Date;
      startTimestamp?: Date;
    };
    message: string;
    roles: RoleStatus[];
    host?: string;
    history?: any[];
  };
  [others: string]: any;

  public async getJobList(params: KubePaginationRequest): Promise<KubePaginationResponse<Job[]>> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/regions/${this.region}/jobs`, {
      params: params,
    });
    return data as KubePaginationResponse<Job[]>;
  }

  public async getJob(params: KubeRequest = {}): Promise<Job> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/jobs/${this.name}`,
      {
        params: params,
      },
    );
    return data as Job;
  }

  public async addJob(): Promise<Job> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/jobs`,
      this,
    );
    return data as Job;
  }

  public async updateJob(): Promise<Job> {
    const data: { [key: string]: any } = await axios.put(
      `pai/tenants/${this.tenant}/regions/${this.region}/jobs/${this.name}`,
      this,
    );
    return data as Job;
  }

  public async deleteJob(): Promise<void> {
    await axios.delete(`pai/tenants/${this.tenant}/regions/${this.region}/jobs/${this.name}`);
  }

  // operate
  public async startJob(): Promise<Job> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/jobs/${this.name}:start`,
    );
    return data as Job;
  }

  public async stopJob(): Promise<Job> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/jobs/${this.name}:stop`,
    );
    return data as Job;
  }

  public async getPodListInJob(params: KubeRequest = {}): Promise<Pod[]> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/jobs/${this.name}/pods`,
      {
        params: params,
      },
    );
    return data as Pod[];
  }

  public async getMountListInJob(params: KubeRequest = {}): Promise<{ roles: { name: string; mounts: SetBase[] }[] }> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/jobs/${this.name}/mounts`,
      {
        params: params,
      },
    );
    return data as { roles: { name: string; mounts: SetBase[] }[] };
  }
}
