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
import { Port } from './job';

export class Image extends Base {
  constructor(image?: { [key: string]: any }) {
    super();
    Object.assign(this, image);
  }

  config: {
    ports: Port[];
    tags?: string[];
    auth?: any;
  } = { ports: [] };
  framework: string;
  image = '';
  public = false;
  annotations: { [key: string]: string } = {};
  labels: { [key: string]: string } = {};
  tenant: string;
  for: string;
  [others: string]: any;

  public async getImageList(params: KubeRequest = {}): Promise<Image[]> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/images`, { params: params });
    return data as Image[];
  }

  public async getImage(params: KubeRequest = {}): Promise<Image> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/images/${this.name}`, {
      params: params,
    });
    return data as Image;
  }

  public async addImage(): Promise<Image> {
    const data: { [key: string]: any } = await axios.post(`pai/tenants/${this.tenant}/images`, this);
    return data as Image;
  }

  public async updateImage(): Promise<Image> {
    const data: { [key: string]: any } = await axios.put(`pai/tenants/${this.tenant}/images/${this.name}`, this);
    return data as Image;
  }

  public async deleteImage(): Promise<void> {
    await axios.delete(`pai/tenants/${this.tenant}/images/${this.name}`);
  }

  public async getImageSelectorList(params: KubeRequest = {}): Promise<{ name: string; values: string[] }[]> {
    const data: { [key: string]: any } = await axios(`pai/tenants/${this.tenant}/images-selectors`, { params: params });
    return data as { name: string; values: string[] }[];
  }

  public async getPublicImageList(params: KubeRequest = {}): Promise<Image[]> {
    const data: { [key: string]: any } = await axios(`pai/images`, { params: params });
    return data as Image[];
  }

  public async getPublicImage(params: KubeRequest = {}): Promise<Image> {
    const data: { [key: string]: any } = await axios(`pai/images/${this.name}`, {
      params: params,
    });
    return data as Image;
  }

  public async addPublicImage(): Promise<Image> {
    const data: { [key: string]: any } = await axios.post(`pai/images`, this);
    return data as Image;
  }

  public async updatePublicImage(): Promise<Image> {
    const data: { [key: string]: any } = await axios.put(`pai/images/${this.name}`, this);
    return data as Image;
  }

  public async deletePublicImage(): Promise<void> {
    await axios.delete(`pai/images/${this.name}`);
  }

  public async getPublicImageSelectorList(params: KubeRequest = {}): Promise<{ name: string; values: string[] }[]> {
    const data: { [key: string]: any } = await axios(`pai/images-selectors`, { params: params });
    return data as { name: string; values: string[] }[];
  }
}
