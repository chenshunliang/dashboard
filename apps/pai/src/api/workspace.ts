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

export class Workspace extends SetBase {
  constructor(workspace?: { [key: string]: any }) {
    super();
    Object.assign(this, workspace);
    this.kind = 'workspace';
  }

  [others: string]: any;

  public static toClassName(): string {
    return 'workspace';
  }

  public async getWorkspaceListByAdmin(params: KubePaginationRequest): Promise<KubePaginationResponse<Workspace[]>> {
    const data: { [key: string]: any } = await axios(`pai/workspaces`, {
      params: params,
    });
    return data as KubePaginationResponse<Workspace[]>;
  }

  public async getWorkspaceByAdmin(params: KubeRequest = {}): Promise<Workspace> {
    const data: { [key: string]: any } = await axios(`pai/workspaces/${this.name}`, {
      params: params,
    });
    return data as Workspace;
  }

  public async addWorkspaceByAdmin(): Promise<Workspace> {
    const data: { [key: string]: any } = await axios.post(`pai/workspaces`, this);
    return data as Workspace;
  }

  public async updateWorkspaceByAdmin(): Promise<Workspace> {
    const data: { [key: string]: any } = await axios.put(`pai/workspaces/${this.name}`, this);
    return data as Workspace;
  }

  public async deleteWorkspaceByAdmin(): Promise<void> {
    await axios.delete(`pai/workspaces/${this.name}`);
  }

  public async getWorkspaceList(params: KubePaginationRequest): Promise<KubePaginationResponse<Workspace[]>> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/regions/${this.region}/workspaces`, {
      params: params,
    });
    return data as KubePaginationResponse<Workspace[]>;
  }

  public async getWorkspace(params: KubeRequest = {}): Promise<Workspace> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/workspaces/${this.name}`,
      {
        params: params,
      },
    );
    return data as Workspace;
  }

  public async addWorkspace(): Promise<Workspace> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/workspaces`,
      this,
    );
    return data as Workspace;
  }

  public async updateWorkspace(): Promise<Workspace> {
    const data: { [key: string]: any } = await axios.put(
      `pai/tenants/${this.tenant}/regions/${this.region}/workspaces/${this.name}`,
      this,
    );
    return data as Workspace;
  }

  public async deleteWorkspace(): Promise<void> {
    await axios.delete(`pai/tenants/${this.tenant}/regions/${this.region}/workspaces/${this.name}`);
  }
}
