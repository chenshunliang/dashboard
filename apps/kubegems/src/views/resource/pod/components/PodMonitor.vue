<!--
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
-->

<template>
  <div>
    <v-card>
      <v-card-title class="py-3">
        <v-flex>
          <v-flex class="float-right">
            <v-sheet class="text-body-2 text--darken-1">
              <BaseAggChartOperator v-model="operator" />
              <BaseDatetimePicker
                v-model="date"
                :default-value="30"
                default-value-for-query
                query-end-time-key="end"
                query-start-time-key="start"
                @change="onDatetimeChange(undefined)"
              />
            </v-sheet>
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-flex>
      </v-card-title>
      <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
        <v-row>
          <v-col cols="6">
            <BaseAreaChart
              label="container"
              :metrics="cpu"
              mode="x"
              :title="$t('table.used', [$root.$t('resource.cpu')])"
              type="cpu"
            />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart
              label="container"
              :metrics="memory"
              mode="x"
              :title="$t('table.used', [$root.$t('resource.memory')])"
              unit="Mi"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <BaseAreaChart label="pod" :metrics="networkin" :title="$t('tip.in_traffic')" type="network" />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart label="pod" :metrics="networkout" :title="$t('tip.out_traffic')" type="network" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-3">
      <v-card-title class="py-1">
        <span class="text-subtitle-1 kubegems__text">{{ $t('tip.node_monitor') }}</span>
      </v-card-title>
      <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
        <v-row>
          <v-col cols="6">
            <BaseAreaChart label="name" :metrics="load" :title="$t('tip.load')" type="" />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart label="node" :metrics="cpuNode" :title="$t('tip.cpu_rate')" type="%" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <BaseAreaChart label="node" :metrics="memoryNode" :title="$t('tip.memory_rate')" type="%" />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart label="name" :metrics="memoryUsed" :title="$t('tip.memory_used_status')" type="memory" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <BaseAreaChart label="device" :metrics="disk" :title="$t('tip.remain_storage')" type="storage" />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart label="name" :metrics="diskiops" :title="$t('tip.disk_iops')" type="" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <BaseAreaChart label="name" :metrics="network" :title="$t('tip.network')" type="network" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  import {
    CONTAINER_CPU_USAGE_PROMQL,
    CONTAINER_MEMORY_USAGE_PROMQL,
    NODE_CPU_USAGE_PROMQL,
    NODE_DISK_AVAILABLE_SIZE_PROMQL,
    NODE_DISK_READ_IOPS_PROMQL,
    NODE_DISK_WRITE_IOPS_PROMQL,
    NODE_LOAD15_PROMQL,
    NODE_LOAD1_PROMQL,
    NODE_LOAD5_PROMQL,
    NODE_MEMORY_BUFFER_PROMQL,
    NODE_MEMORY_CACHED_PROMQL,
    NODE_MEMORY_TOTAL_PROMQL,
    NODE_MEMORY_USAGE_PROMQL,
    NODE_MEMORY_USED_PROMQL,
    NODE_NETWORK_IN_PROMQL,
    NODE_NETWORK_OUT_PROMQL,
    POD_NETWORK_IN_PROMQL,
    POD_NETWORK_OUT_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { constructPromQLByOperator } from '@kubegems/libs/utils/prometheus';
  import BasePermission from '@kubegems/mixins/permission';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapState } from 'vuex';

  import messages from '../i18n';

  export default {
    name: 'PodMonitor',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        cpu: [],
        memory: [],
        networkin: [],
        networkout: [],
        load: [],
        cpuNode: [],
        memoryNode: [],
        network: [],
        disk: [],
        diskiops: [],
        memoryUsed: [],
        date: [],
        params: {
          start: '',
          end: '',
          noprocessing: true,
        },
        timeinterval: null,
        operator: 'default',
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      item() {
        this.loadMetrics();
      },
      operator() {
        this.loadData();
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    mounted() {
      this.$nextTick(() => {
        this.onDatetimeChange();
      });
    },
    methods: {
      async loadMetrics() {
        if (this.timeinterval) clearInterval(this.timeinterval);
        this.loadData();
        this.timeinterval = setInterval(() => {
          this.params.start = this.$moment(this.params.start).utc().add(30, 'seconds').format();
          this.params.end = this.$moment(this.params.end).utc().add(30, 'seconds').format();
          this.loadData();
        }, 1000 * 30);
      },
      async loadData() {
        this.podCPUUsage();
        this.podMemoryUsage();
        this.podNetworkIn();
        this.podNetworkOut();
        if (this.item?.spec?.nodeName) {
          this.nodeLoadRange();
          this.nodeCPUUsage();
          this.nodeMemoryUsage();
          this.nodeMemoryUsed();
          this.nodeDiskSize();
          this.nodeDiskIOPS();
          this.nodeNetworkUsage();
        }
      },
      async podCPUUsage() {
        const containers = [];
        if (this.item) {
          this.item.spec.containers.forEach((container) => {
            containers.push(container.name);
          });
          let query = CONTAINER_CPU_USAGE_PROMQL.replaceAll('$1', containers.join('|'))
            .replaceAll('$2', this.item.metadata.name)
            .replaceAll('$3', this.item.metadata.namespace);
          query = constructPromQLByOperator(this.operator, query, this.params.start, this.params.end);
          const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
          if (data) this.cpu = data;
        }
      },
      async podMemoryUsage() {
        const containers = [];
        if (this.item) {
          this.item.spec.containers.forEach((container) => {
            containers.push(container.name);
          });
          let query = CONTAINER_MEMORY_USAGE_PROMQL.replaceAll('$1', containers.join('|'))
            .replaceAll('$2', this.item.metadata.name)
            .replaceAll('$3', this.item.metadata.namespace);
          query = constructPromQLByOperator(this.operator, query, this.params.start, this.params.end);
          const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
          if (data) this.memory = data;
        }
      },
      async podNetworkIn() {
        if (this.item) {
          let query = POD_NETWORK_IN_PROMQL.replaceAll('$1', this.item.metadata.name).replaceAll(
            '$2',
            this.item.metadata.namespace,
          );
          query = constructPromQLByOperator(this.operator, query, this.params.start, this.params.end);
          const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
          if (data) this.networkin = data;
        }
      },
      async podNetworkOut() {
        if (this.item) {
          let query = POD_NETWORK_OUT_PROMQL.replaceAll('$1', this.item.metadata.name).replaceAll(
            '$2',
            this.item.metadata.namespace,
          );
          query = constructPromQLByOperator(this.operator, query, this.params.start, this.params.end);
          const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
          if (data) this.networkout = data;
        }
      },
      async nodeMemoryUsed() {
        const data1 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_MEMORY_TOTAL_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data1?.length > 0) data1[0].metric['name'] = this.$t('tip.total_memory');
        const data2 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_MEMORY_USED_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data2?.length > 0) data2[0].metric['name'] = this.$t('tip.used_memory');
        const data3 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_MEMORY_BUFFER_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data3?.length > 0) data3[0].metric['name'] = this.$t('tip.buffer_memory');
        const data4 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_MEMORY_CACHED_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data4?.length > 0) data4[0].metric['name'] = this.$t('tip.cached_memory');
        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        if (data3) data = data.concat(data3);
        if (data4) data = data.concat(data4);
        this.memoryUsed = data;
      },
      async nodeLoadRange() {
        const data1 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_LOAD1_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data1?.length > 0) data1[0].metric['name'] = this.$t('tip.load_1');
        const data2 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_LOAD5_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data2?.length > 0) data2[0].metric['name'] = this.$t('tip.load_5');
        const data3 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_LOAD15_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data3?.length > 0) data3[0].metric['name'] = this.$t('tip.load_15');
        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        if (data3) data = data.concat(data3);
        this.load = data;
      },
      async nodeCPUUsage() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_CPU_USAGE_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data) this.cpuNode = data;
      },
      async nodeMemoryUsage() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_MEMORY_USAGE_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data) this.memoryNode = data;
      },
      async nodeNetworkUsage() {
        const data1 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_NETWORK_IN_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data1?.length > 0) data1[0].metric['name'] = this.$t('tip.in_traffic');
        const data2 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_NETWORK_OUT_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data2?.length > 0) data2[0].metric['name'] = this.$t('tip.out_traffic');
        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        this.network = data;
      },
      async nodeDiskSize() {
        const data = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_DISK_AVAILABLE_SIZE_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data) this.disk = data;
      },
      async nodeDiskIOPS() {
        const data1 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_DISK_WRITE_IOPS_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data1?.length > 0) data1[0].metric['name'] = this.$t('tip.write_iops');
        const data2 = await this.m_permission_matrix(
          this.ThisCluster,
          Object.assign(this.params, {
            query: constructPromQLByOperator(
              this.operator,
              NODE_DISK_READ_IOPS_PROMQL.replaceAll('$1', this.item.spec.nodeName),
              this.params.start,
              this.params.end,
            ),
          }),
        );
        if (data2?.length > 0) data2[0].metric['name'] = this.$t('tip.read_iops');
        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);
        this.diskiops = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.$router.replace({
          params: this.$route.params,
          query: {
            ...this.$route.query,
            start: this.$moment(this.params.start).utc().format(),
            end: this.$moment(this.params.end).utc().format(),
          },
        });
        this.loadMetrics();
      },
    },
  };
</script>
