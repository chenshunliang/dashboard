/*
 * Copyright 2022 The kubegems.io Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { getApiVersion } from '@kubegems/libs/utils/helpers';
import { V1CronJob } from '@kubernetes/client-node/dist/gen/model/v1CronJob';
import { V1CronJobSpec } from '@kubernetes/client-node/dist/gen/model/v1CronJobSpec';
import { V1CronJobStatus } from '@kubernetes/client-node/dist/gen/model/v1CronJobStatus';
import axios from 'axios';

import { Metadata, initKModel } from './kubernetes';

export class CronJob extends V1CronJob {
  constructor(cronjob?: { [key: string]: any }) {
    super();
    this.apiVersion = getApiVersion('cronjob', 'batch/v1beta1');
    this.kind = 'CronJob';
    this.metadata = new Metadata();
    this.spec = initKModel<V1CronJobSpec>(V1CronJobSpec.attributeTypeMap);
    this.status = initKModel<V1CronJobStatus>(V1CronJobStatus.attributeTypeMap);

    if (cronjob) Object.assign(this, cronjob);
  }

  public async getCronJobList(
    cluster: string,
    params: KubePaginationRequest,
  ): Promise<KubePaginationResponse<CronJob[]>> {
    const apiVersion: string = getApiVersion('cronjob', 'batch/v1beta1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<CronJob[]>;
  }

  public async getCronJob(cluster: string, params: KubeRequest = {}): Promise<CronJob> {
    const apiVersion: string = getApiVersion('cronjob', 'batch/v1beta1');
    const data: { [key: string]: any } = await axios(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs/${this.metadata.name}`,
      {
        params: params,
      },
    );
    return data as CronJob;
  }

  public async addCronJob(cluster: string): Promise<CronJob> {
    const apiVersion: string = getApiVersion('cronjob', 'batch/v1beta1');
    const data: { [key: string]: any } = await axios.post(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs/${this.metadata.name}`,
      this,
    );
    return data as CronJob;
  }

  public async updateCronJob(cluster: string): Promise<CronJob> {
    const apiVersion: string = getApiVersion('cronjob', 'batch/v1beta1');
    const data: { [key: string]: any } = await axios.patch(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs/${this.metadata.name}`,
      this,
    );
    return data as CronJob;
  }

  public async deleteCronJob(cluster: string): Promise<void> {
    const apiVersion: string = getApiVersion('cronjob', 'batch/v1beta1');
    await axios.delete(
      `proxy/cluster/${cluster}/${apiVersion}/namespaces/${this.metadata.namespace}/cronjobs/${this.metadata.name}`,
    );
  }
}
