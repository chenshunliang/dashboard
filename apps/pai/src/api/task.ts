import axios from 'axios';

export class AsyncTask {
  constructor(task?: { [key: string]: any }) {
    Object.assign(this, task);
  }

  completionTimestamp: Date;
  config: { [key: string]: any } = {};
  createTimestamp: Date;
  creator: string;
  jobName: string;
  kind = '';
  message: string;
  name: string;
  fullName: string;
  phase: string;
  startTimestamp: Date;
  storageSetName: string;
  storageSetKind: string;
  tenant: string;
  podName: string;
  [others: string]: any;

  public async getAdminTaskList(params: KubePaginationRequest): Promise<KubePaginationResponse<AsyncTask[]>> {
    const data: { [key: string]: any } = await axios(`pai/regions/${this.region}/storageset-jobs`, {
      params: params,
    });
    return data as KubePaginationResponse<AsyncTask[]>;
  }

  public async addAdminTask(): Promise<AsyncTask> {
    const data: { [key: string]: any } = await axios.post(
      `pai/regions/${this.region}/storageset-jobs/${this.storageSetKind}/${this.name}`,
      this,
    );
    return data as AsyncTask;
  }

  public async updateAdminTask(): Promise<AsyncTask> {
    const data: { [key: string]: any } = await axios.put(
      `pai/regions/${this.region}/storageset-jobs/${this.fullName}`,
      this,
    );
    return data as AsyncTask;
  }

  public async removeAdminTask(): Promise<void> {
    await axios.delete(`pai/regions/${this.region}/storageset-jobs/${this.fullName}`);
  }

  public async controlAdminTask(action: string): Promise<AsyncTask> {
    const data: { [key: string]: any } = await axios.post(
      `pai/regions/${this.region}/storageset-jobs/${this.fullName}:${action}`,
      this,
    );
    return data as AsyncTask;
  }

  public async getTaskList(params: KubePaginationRequest): Promise<KubePaginationResponse<AsyncTask[]>> {
    const data: { [key: string]: any } = await axios(
      `pai/tenants/${this.tenant}/regions/${this.region}/storageset-jobs`,
      {
        params: params,
      },
    );
    return data as KubePaginationResponse<AsyncTask[]>;
  }

  public async addTask(): Promise<AsyncTask> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/storageset-jobs/${this.storageSetKind}/${this.name}`,
      this,
    );
    return data as AsyncTask;
  }

  public async updateTask(): Promise<AsyncTask> {
    const data: { [key: string]: any } = await axios.put(
      `pai/tenants/${this.tenant}/regions/${this.region}/storageset-jobs/${this.fullName}`,
      this,
    );
    return data as AsyncTask;
  }

  public async removeTask(): Promise<void> {
    await axios.delete(`pai/tenants/${this.tenant}/regions/${this.region}/storageset-jobs/${this.fullName}`);
  }

  public async controlTask(action: string): Promise<AsyncTask> {
    const data: { [key: string]: any } = await axios.post(
      `pai/tenants/${this.tenant}/regions/${this.region}/storageset-jobs/${this.fullName}:${action}`,
      this,
    );
    return data as AsyncTask;
  }
}
