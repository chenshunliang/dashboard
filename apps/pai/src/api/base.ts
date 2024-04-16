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
import { Vector } from '@kubegems/api/typed/prometheus';
import { useStore } from '@kubegems/extension/store';
import { JUICEFS_TOTAL_BYTES_PROMQL, JUICEFS_TOTAL_FILES_PROMQL } from '@kubegems/libs/constants/prometheus';

const store = useStore();

export class HuggingfaceSet {
  constructor(huggingface?: { [key: string]: any }) {
    Object.assign(this, huggingface);
  }

  accesstoken: string;
  kind: string;
  name: string;
}

export class UrlSet {
  constructor(url?: { [key: string]: any }) {
    Object.assign(this, url);
  }

  format: string;
  url: string;
}

export class Base {
  constructor(base?: { [key: string]: any }) {
    Object.assign(this, base);
  }

  createdAt: Date;
  creator: string;
  description: string;
  name: string;
  updatedAt: Date;
  deletedAt?: Date;
}

export class SetConfig {
  constructor(config?: { [key: string]: any }) {
    Object.assign(this, config);
  }

  capacity = '10Gi';
  username?: string;
  password?: string;
  addr?: string;
  branch?: string;
  extra?: {
    fromHuggingface?: HuggingfaceSet;
    fromURL?: UrlSet;
  };
}

export class SetStatus {
  constructor(status?: { [key: string]: any }) {
    Object.assign(this, status);
  }

  bucket: string;
  host: string;
  password: string;
  username: string;
  [others: string]: any;
}

export class ModelXConfig {
  constructor(config?: { [key: string]: any }) {
    Object.assign(this, config);
  }

  name: string;
  url: string;
  token: string;
  [others: string]: any;
}

export class HuggingfaceConfig {
  constructor(config?: { [key: string]: any }) {
    Object.assign(this, config);
  }

  name: string;
  token: string;
  [others: string]: any;
}

export class UriConfig {
  constructor(config?: { [key: string]: any }) {
    Object.assign(this, config);
  }

  urls: string;
  [others: string]: any;
}

export class Downloader {
  constructor(download?: { [key: string]: any }) {
    Object.assign(this, download);
  }

  name: string;
  kind: string;
  config: UriConfig | HuggingfaceConfig | ModelXConfig;
  message: string;
  phase: string;
  startTimestamp: Date;

  [others: string]: any;
}

export class SetBase extends Base {
  constructor(set?: { [key: string]: any }) {
    super();
    Object.assign(this, set);
  }

  config: SetConfig = new SetConfig();
  downloaders: Downloader[] = [];
  kind?: string;
  status: SetStatus = new SetStatus();
  region: string;
  tenant: string;
  labels: { [key: string]: string } = {};
  annotations: { [key: string]: string } = {};
  public: boolean;
  source: string;

  [others: string]: any;

  public async getSetBucketMetrics(
    bucketItems: string[],
    KubeRequest = {},
  ): Promise<{ count: { [key: string]: string }; size: { [key: string]: string } }> {
    const sizeVectorItems = await new Vector().getVector(store.getters.Region().ClusterName, {
      query: JUICEFS_TOTAL_BYTES_PROMQL.replaceAll('$1', bucketItems.join('|')).replaceAll('%', ''),
      ...KubeRequest,
    });
    const sizeVectorMap = {};
    sizeVectorItems.forEach((v) => {
      sizeVectorMap[v.metric.bucket] = v.value[1];
    });
    const countVectorItems: Vector[] = await new Vector().getVector(store.getters.Region().ClusterName, {
      query: JUICEFS_TOTAL_FILES_PROMQL.replaceAll('$1', bucketItems.join('|')).replaceAll('%', ''),
      ...KubeRequest,
    });
    const countVectorMap = {};
    countVectorItems.forEach((v) => {
      countVectorMap[v.metric.bucket] = v.value[1];
    });
    return { count: countVectorMap, size: sizeVectorMap };
  }
}
