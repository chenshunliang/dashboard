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

import axios from 'axios';

class AlertLevel {
  constructor(alertLevel?: { [key: string]: any }) {
    Object.assign(this, alertLevel);
  }

  compareOp?: string = '';
  compareValue?: string = '';
  severity?: string = '';
}

class Receiver {
  constructor(receiver?: { [key: string]: any }) {
    Object.assign(this, receiver);
  }

  id?: number = 0;
  interval?: string = '';
  alertRuleID?: number = 0;
  alertChannelID?: number = 0;
  alertChannel?: any;
}

export class PrometheusRule {
  constructor(rule?: { [key: string]: any }) {
    Object.assign(this, rule);
  }

  id?: number = 0;
  for?: string = '';
  expr?: string = '';
  createdAt?: Date = new Date();
  cluster?: string = '';
  alertType?: string = '';
  isOpen?: boolean = false;
  message?: string = '';
  name?: string = '';
  namespace?: string = '';
  state?: string = '';
  updatedAt?: Date = new Date();
  alertLevels?: AlertLevel[] = [];
  inhibitLabels?: string[] = [];
  logqlGenerator?: any;
  promqlGenerator?: any;
  receivers?: Receiver[] = [];
  [others: string]: any;

  public async addPrometheusRule(): Promise<PrometheusRule> {
    let data: { [key: string]: any };
    if (this.alertType === 'monitor') {
      data = await axios.post(
        `observability/cluster/${this.cluster}/namespaces/${this.namespace}/monitor/alerts`,
        this,
      );
    } else if (this.alertType === 'logging') {
      data = await axios.post(
        `observability/cluster/${this.cluster}/namespaces/${this.namespace}/logging/alerts`,
        this,
      );
    }
    return data as PrometheusRule;
  }

  public async getLabelValues(params: KubeRequest = {}): Promise<string[]> {
    let data: { [key: string]: any };
    if (this.alertType === 'monitor') {
      data = await axios(
        `observability/cluster/${this.cluster}/namespaces/${this.namespace}/monitor/metrics/labelvalues`,
        { params: params },
      );
    } else if (this.alertType === 'logging') {
      const resData: { [key: string]: any } = await axios(`proxy/cluster/${this.cluster}/custom/loki/v1/series`, {
        params: params,
      });
      const values = [];
      resData.forEach((d) => {
        if (values.indexOf(d[params.label]) === -1 && d[params.label]) values.push(d[params.label]);
      });
      data = values;
    }

    return data as string[];
  }
}
