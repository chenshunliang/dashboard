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
import { EDGE_DEVICEID_KEY } from '@kubegems/libs/constants/label';
import { sizeOfCpu, sizeOfStorage, sizeOfTke } from '@kubegems/libs/utils/helpers';
import { stringifySelector } from '@kubegems/libs/utils/k8s_selector';

import { Cluster, ClusterResoureQuota } from '../typed/cluster';
import { EdgeCluster } from '../typed/edge_cluster';
import { EdgeHub } from '../typed/edge_hub';
import { convertResponse2List, convertResponse2Pagination } from '../utils';

export const useClusterList = async (cluster: Cluster): Promise<Cluster[]> => {
  const _data: KubePaginationResponse<Cluster[]> = await cluster.getClusterList({
    page: 1,
    size: 1000,
    noprocessing: true,
  });
  return convertResponse2List<Cluster>(_data);
};

export const useEdgeHubList = async (edgeHub: EdgeHub): Promise<EdgeHub[]> => {
  const _data: EdgeHub[] = await edgeHub.getEdgeHubList({
    noprocessing: true,
  });
  return _data as EdgeHub[];
};

export const useEdgeClusterList = async (
  edge: EdgeCluster,
  labels: { [key: string]: string[] } = {},
): Promise<Cluster[]> => {
  const labelSelector: string = stringifySelector({
    matchExpressions: Object.keys(labels).map((key) => {
      return {
        key: key,
        operator: 'in',
        values: labels[key],
      };
    }),
  });

  const _data: KubePaginationResponse<EdgeCluster[]> = await edge.getEdgeClusterList({
    page: 1,
    size: 1000,
    noprocessing: true,
    labels: labelSelector,
  });
  const clusterList = convertResponse2List<EdgeCluster>(_data).map((edge: EdgeCluster, index: number) => {
    return {
      ID: index,
      ClusterName: edge.metadata.name,
      Version: edge.spec.register.hubName,
      Upstream: edge.spec.register.hubName,
      Status: edge.status.phase,
      DisplayName: edge.metadata.labels?.[EDGE_DEVICEID_KEY] || '',
    };
  });
  return clusterList as Cluster[];
};

export const useEdgeClusterPagination = async (
  edge: EdgeCluster,
  page = 1,
  size = 10,
  labels: { [key: string]: string[] } = {},
  search = '',
): Promise<Pagination<EdgeCluster>> => {
  const labelSelector: string = stringifySelector({
    matchExpressions: Object.keys(labels).map((key) => {
      return {
        key: key,
        operator: 'in',
        values: labels[key],
      };
    }),
  });

  const _data: KubePaginationResponse<EdgeCluster[]> = await edge.getEdgeClusterList({
    page: page,
    size: size,
    noprocessing: true,
    labels: labelSelector,
    search: search,
  });

  return convertResponse2Pagination<EdgeCluster>(_data);
};

export const useEdgeClusterConvertToCluster = async (cluster: string): Promise<Cluster> => {
  const data: EdgeCluster = await new EdgeCluster({ metadata: { name: cluster } }).getEdgeCluster();
  return new Cluster({
    ClusterName: data.metadata.name,
    Version: data.status.manufacture['edge.kubegems.io/kubernetes-version'] || '',
    OversoldConfig: {
      cpu: 1,
      memory: 1,
      storage: 1,
    },
  });
};

export const useClusterQuota = async (
  cluster: Cluster,
  item: { [key: string]: any },
): Promise<{ [key: string]: any }> => {
  const data: ClusterResoureQuota = await cluster.getResourceQuota();
  const quota: { [key: string]: any } = {};
  if (data.resources) {
    quota.CpuRatio = data.oversoldConfig ? data.oversoldConfig.cpu : 1;
    quota.MemoryRatio = data.oversoldConfig ? data.oversoldConfig.memory : 1;
    quota.StorageRatio = data.oversoldConfig ? data.oversoldConfig.storage : 1;
    quota.Cpu = parseFloat(sizeOfCpu(data.resources.capacity['limits.cpu']).toString()) * quota.CpuRatio;
    quota.UsedCpu = parseFloat(sizeOfCpu(data.resources.tenantAllocated['limits.cpu']).toString());
    quota.AllocatedCpu = quota.Cpu - quota.UsedCpu + item.NowCpu;
    quota.Memory = parseFloat(sizeOfStorage(data.resources.capacity['limits.memory']).toString()) * quota.MemoryRatio;
    quota.UsedMemory = parseFloat(sizeOfStorage(data.resources.tenantAllocated['limits.memory']).toString());
    quota.AllocatedMemory = quota.Memory - quota.UsedMemory + item.NowMemory;
    quota.Storage =
      parseFloat(sizeOfStorage(data.resources.capacity['limits.ephemeral-storage']).toString()) * quota.StorageRatio;
    quota.UsedStorage = parseFloat(sizeOfStorage(data.resources.tenantAllocated['limits.storage']).toString());
    quota.AllocatedStorage = quota.Storage - quota.UsedStorage + item.NowStorage;

    if (
      data.resources.capacity['limits.nvidia.com/gpu'] &&
      parseInt(data.resources.capacity[`limits.nvidia.com/gpu`]) > 0
    ) {
      quota.NvidiaGpu = parseFloat(data.resources.capacity['limits.nvidia.com/gpu']);
      quota.UsedNvidiaGpu = parseFloat(data.resources.tenantAllocated['limits.nvidia.com/gpu'] || 0);
      quota.AllocatedNvidiaGpu = quota.NvidiaGpu - quota.UsedNvidiaGpu + (item.NowNvidiaGpu || 0);
    }

    if (
      (data.resources.capacity['limits.tencent.com/vcuda-core'] &&
        parseInt(data.resources.capacity[`limits.tencent.com/vcuda-core`]) > 0) ||
      (data.resources.capacity['limits.tencent.com/vcuda-memory'] &&
        parseInt(data.resources.capacity[`limits.tencent.com/vcuda-memory`]) > 0)
    ) {
      quota.TkeGpu = parseFloat(sizeOfTke(data.resources.capacity['limits.tencent.com/vcuda-core']).toString());
      quota.UsedTkeGpu = parseFloat(
        sizeOfTke(data.resources.tenantAllocated['limits.tencent.com/vcuda-core'] || 0).toString(),
      );
      quota.AllocatedTkeGpu = quota.TkeGpu - quota.UsedTkeGpu + (item.NowTkeGpu || 0);

      quota.TkeMemory = parseFloat(sizeOfTke(data.resources.capacity['limits.tencent.com/vcuda-memory']).toString());
      quota.UsedTkeMemory = parseFloat(
        sizeOfTke(data.resources.tenantAllocated['limits.tencent.com/vcuda-memory'] || 0).toString(),
      );
      quota.AllocatedTkeMemory = quota.TkeMemory - quota.UsedTkeMemory + (item.NowTkeMemory || 0);
    }
    return quota;
  }
  return null as any;
};
