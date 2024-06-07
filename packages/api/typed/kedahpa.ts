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

import { SERVICE_MONITOR_NS, SERVICE_PAI } from '@kubegems/libs/constants/namespace';
import { getApiVersion } from '@kubegems/libs/utils/helpers';
import axios from 'axios';

import { Metadata } from './kubernetes';

export class HPA {
  constructor(hpa?: { [key: string]: any }) {
    this.apiVersion = getApiVersion('keda', 'keda.sh/v1alpha1');
    this.kind = 'ScaledObject';
    this.metadata = new Metadata();
    this.metadata.namespace = SERVICE_PAI;
    this.spec = {
      minReplicaCount: 1,
      maxReplicaCount: 100,
      scaleTargetRef: {
        apiVersion: `pai.kubegems.io/v1beta1`,
        kind: 'Job',
        name: '',
      },
      advanced: {
        horizontalPodAutoscalerConfig: {
          name: '',
        },
      },
      triggers: [
        {
          type: 'cpu',
          metricType: 'Utilization',
          metadata: {
            value: '0',
          },
        },
        {
          type: 'memory',
          metricType: 'Utilization',
          metadata: {
            value: '0',
          },
        },
        {
          type: 'prometheus',
          metadata: {
            serverAddress: `http://kube-prometheus-stack-prometheus.${SERVICE_MONITOR_NS}:9090`,
            metricName: 'pai_job_gpu_utils',
            query: 'avg(pai_job_gpu_utils{namespace="kubegems-pai", pod=~"$1"})',
            threshold: '0',
          },
        },
      ],
    };

    if (hpa) Object.assign(this, hpa);
  }

  spec: {
    minReplicaCount?: number;
    maxReplicaCount?: number;
    scaleTargetRef: {
      apiVersion: string;
      kind: string;
      name: string;
    };
    advanced: { horizontalPodAutoscalerConfig: { name: string } };
    triggers: {
      type: string;
      metricType?: string;
      metadata: { [key: string]: any };
    }[];
  };
  [others: string]: any;

  public async getHPAList(cluster: string, params: KubePaginationRequest): Promise<KubePaginationResponse<HPA[]>> {
    const apiVersion: string = getApiVersion('keda', 'keda.sh/v1alpha1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/scaledobjects`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<HPA[]>;
  }

  public async getHPA(cluster: string, params: KubeRequest = {}): Promise<HPA> {
    const apiVersion: string = getApiVersion('keda', 'keda.sh/v1alpha1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/scaledobjects/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as HPA;
  }

  public async addHPA(cluster: string): Promise<HPA> {
    const apiVersion: string = getApiVersion('keda', 'keda.sh/v1alpha1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/scaledobjects/${this.metadata.name}`,
      this,
    );
    return data as HPA;
  }

  public async updateHPA(cluster: string): Promise<HPA> {
    const apiVersion: string = getApiVersion('keda', 'keda.sh/v1alpha1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/scaledobjects/${this.metadata.name}`,
      this,
    );
    return data as HPA;
  }

  public async deleteHPA(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('keda', 'keda.sh/v1alpha1');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/scaledobjects/${this.metadata.name}`,
    );
  }
}
