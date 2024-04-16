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
import * as audit from './audit';
import * as broadcast from './broadcast';
import * as cluster from './cluster';
import * as environment from './environment';
import * as message from './message';
import * as project from './project';
import * as role from './role';
import * as tenant from './tenant';
import * as user from './user';
import * as virtualSpace from './virtualspace';

export default { audit, broadcast, cluster, environment, project, role, tenant, user, virtualSpace, message };
