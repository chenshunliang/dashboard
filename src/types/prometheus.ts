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

interface MatrixExtend {
  getMatrixFromObservabilityByMonitor(clusterName: string, namespace: string, params: KubeRequest): Promise<Matrix[]>;
}

export class Matrix implements MatrixExtend {
  metric?: { [key: string]: string };
  values?: (number | string)[][];

  public async getMatrix(cluster: string, params: KubeRequest): Promise<Matrix[]> {
    const data: { [key: string]: any } = await axios(`proxy/cluster/${cluster}/custom/prometheus/v1/matrix`, {
      params: params,
    });
    return data as Matrix[];
  }

  public async getMatrixFromObservabilityByMonitor(
    clusterName: string,
    namespace: string,
    params: KubeRequest,
  ): Promise<Matrix[]> {
    const data: { [key: string]: any } = await axios(
      `observability/cluster/${clusterName}/namespaces/${namespace}/monitor/metrics/queryrange`,
      {
        params: params,
      },
    );
    return data as Matrix[];
  }
}

export class Vector {
  metric?: { [key: string]: string };
  value?: (number | string)[];

  public async getVector(cluster: string, params: KubeRequest): Promise<Vector[]> {
    const data: { [key: string]: any } = await axios(`proxy/cluster/${cluster}/custom/prometheus/v1/vector`, {
      params: params,
    });
    return data as Vector[];
  }
}
