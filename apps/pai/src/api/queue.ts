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

export class Queue extends Base {
  constructor(queue?: { [key: string]: any }) {
    super();
    Object.assign(this, queue);
  }

  reclaimable = true;
  weight = 0;
  region: string;
  capability: { [key: string]: string } = {};
  request: { [key: string]: string } = {};
  status: {
    allocated: {
      cpu: string;
      memory: string;
      [others: string]: string;
    };
  };
  [others: string]: any;

  public async getQueueList(params: KubeRequest = {}): Promise<Queue[]> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/queues`, { params: params });
    return data as Queue[];
  }

  public async getQueue(params: KubeRequest = {}): Promise<Queue> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/queues/${this.name}`, {
      params: params,
    });
    return data as Queue;
  }

  public async addQueue(): Promise<Queue> {
    const data: { [key: string]: any } = await axios.post(`pai/regions/${this.region}/queues`, this);
    return data as Queue;
  }

  public async updateQueue(): Promise<Queue> {
    const data: { [key: string]: any } = await axios.put(`pai/regions/${this.region}/queues/${this.name}`, this);
    return data as Queue;
  }

  public async deleteQueue(): Promise<void> {
    await axios.delete(`pai/regions/${this.region}/queues/${this.name}`);
  }
}
