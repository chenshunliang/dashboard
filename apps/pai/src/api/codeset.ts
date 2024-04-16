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

export class Codeset extends SetBase {
  constructor(codeset?: { [key: string]: any }) {
    super();
    Object.assign(this, codeset);
    this.kind = 'codeset';
  }

  [others: string]: any;

  public static toClassName(): string {
    return 'codeset';
  }

  public async getCodesetList(params: KubePaginationRequest): Promise<KubePaginationResponse<Codeset[]>> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/regions/${this.region}/codesets`, {
      params: params,
    });
    return data as KubePaginationResponse<Codeset[]>;
  }

  public async getCodeset(params: KubeRequest = {}): Promise<Codeset> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/codesets/${this.name}`,
      {
        params: params,
      },
    );
    return data as Codeset;
  }

  public async addCodeset(): Promise<Codeset> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/codesets`,
      this,
    );
    return data as Codeset;
  }

  public async updateCodeset(): Promise<Codeset> {
    const data: { [key: string]: any } = await axios.put(
      `pai/tenants/${this.tenant}/regions/${this.region}/codesets/${this.name}`,
      this,
    );
    return data as Codeset;
  }

  public async deleteCodeset(): Promise<void> {
    await axios.delete(`pai/tenants/${this.tenant}/regions/${this.region}/codesets/${this.name}`);
  }
}
