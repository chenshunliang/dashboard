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
import { useClusterList } from '@kubegems/api/hooks/cluster';
import { useEnvironmentListInProject } from '@kubegems/api/hooks/project';
import { useProjectListInTenant, useTenantList } from '@kubegems/api/hooks/tenant';
import { useUserTenantList } from '@kubegems/api/hooks/user';
import { useVirtualSpaceList } from '@kubegems/api/hooks/virtualspace';
import { Cluster } from '@kubegems/api/typed/cluster';
import { Project } from '@kubegems/api/typed/project';
import { Tenant } from '@kubegems/api/typed/tenant';
import { User } from '@kubegems/api/typed/user';
import { VirtualSpace } from '@kubegems/api/typed/virtualspace';

export async function useVirtualSpace(): Promise<{ [key: string]: string | number }[]> {
  const data = await useVirtualSpaceList(new VirtualSpace());
  const virtualSpaceSelect: { [key: string]: string | number }[] = [];
  data.forEach((r: any): void => {
    virtualSpaceSelect.push({
      VirtualSpaceName: r.VirtualSpaceName,
      ID: r.ID,
    });
  });
  return virtualSpaceSelect;
}

export async function useCluster(): Promise<{ [key: string]: string | number }[]> {
  const data = await useClusterList(new Cluster());
  const clusterSelect: { [key: string]: string | number }[] = [];
  data.forEach((c: any): void => {
    clusterSelect.push({
      ClusterName: c.ClusterName,
      Version: c.Version,
      ID: c.ID,
    });
  });
  return clusterSelect;
}

export async function useTenant(admin: boolean, userid: number): Promise<{ [key: string]: string | number }[]> {
  let data: Tenant[] = [];
  if (admin) {
    data = await useTenantList(new Tenant());
  } else {
    data = await useUserTenantList(new User({ ID: userid }));
  }
  const tenantSelect: { [key: string]: string | number }[] = [];
  data.forEach((tenant: any): void => {
    if (tenant.IsActive && ((tenant.Clusters && tenant.Clusters.length > 0) || tenant.ResourceQuotas)) {
      tenantSelect.push({
        TenantName: tenant.TenantName,
        ID: tenant.ID,
      });
    }
  });
  return tenantSelect;
}

export async function useProject(tenantid: number): Promise<{ [key: string]: string | number }[]> {
  const data = await useProjectListInTenant(new Tenant({ ID: tenantid }));
  const tenantProjectSelect: { [key: string]: string | number }[] = [];
  data.forEach((p: any): void => {
    tenantProjectSelect.push({
      ProjectName: p.ProjectName,
      ID: p.ID,
      TenantID: p.TenantID,
    });
  });
  return tenantProjectSelect;
}

export async function useEnvironment(projectid: number): Promise<{ [key: string]: string | number }[]> {
  const data = await useEnvironmentListInProject(new Project({ ID: projectid }));
  const projectEnvironmentSelect: { [key: string]: string | number }[] = [];
  data.forEach((ns: any): void => {
    projectEnvironmentSelect.push({
      EnvironmentName: ns.EnvironmentName,
      ID: ns.ID,
      Namespace: ns.Namespace,
      ClusterName: ns.Cluster?.ClusterName,
      ClusterID: ns.ClusterID,
      Type: ns.MetaType,
      Version: ns.Cluster?.Version,
      AllowEdgeRegistration: ns.AllowEdgeRegistration,
    });
  });
  return projectEnvironmentSelect;
}
