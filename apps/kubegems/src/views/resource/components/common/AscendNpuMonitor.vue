<template>
  <v-card outlined>
    <v-card-title class="py-1">
      <v-flex>
        <v-flex class="d-flex justify-end">
          <BaseAggChartOperator v-model="operator" />
          <BaseDatetimePicker
            v-model="date"
            :default-value="30"
            default-value-for-query
            query-end-time-key="end"
            query-start-time-key="start"
            @change="onDatetimeChange(undefined)"
          />
        </v-flex>
        <div class="float-right logo text--primary text-body-2"> ascend-device-plugin </div>
        <div class="float-right mr-1"> <BaseLogo icon-name="huawei" :ml="2" :width="20" /> </div>
        <div class="float-right logo text--primary text-body-2"> Provider By </div>

        <div class="kubegems__clear-float" />
      </v-flex>
    </v-card-title>
    <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
      <v-row>
        <v-col cols="6">
          <BaseAreaChart
            label="name"
            :metrics="npu"
            :title="$t('tip.gpu_used_prcent', [$root.$t('resource.npu')])"
            type="%"
          />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart
            label="name"
            :metrics="npuMemory"
            :title="$t('tip.gpu_used', [$t('tip.npu_memory')])"
            unit="MB"
          />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart label="name" :metrics="npuTemp" :title="$t('tip.npu_temp')" type="°C" />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart label="name" :metrics="npuPower" :title="$t('tip.npu_power')" type="W" />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart label="name" :metrics="npuFreq" :title="$t('tip.npu_freq')" unit="MHZ" />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart label="name" :metrics="npuHBMMemory" :title="$t('tip.npu_hbm_memory')" unit="MB" />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart label="name" :metrics="npuBandwidth" :title="$t('tip.npu_band_width')" unit="MB/s" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import { getPodList } from '@kubegems/api/direct';
  import { convertResponse2List } from '@kubegems/api/utils';
  import {
    PAI_NPU_BANDWIDTH_RX_PROMQL,
    PAI_NPU_BANDWIDTH_TX_PROMQL,
    PAI_NPU_FREQ_PROMQL,
    PAI_NPU_HBM_MEMORY_TOTAL_PROMQL,
    PAI_NPU_HBM_MEMORY_USED_PROMQL,
    PAI_NPU_MEMORY_TOTAL_PROMQL,
    PAI_NPU_MEMORY_USED_PROMQL,
    PAI_NPU_POWER_PROMQL,
    PAI_NPU_TEMPERATURE_PROMQL,
    PAI_NPU_USAGE_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import { constructPromQLByOperator } from '@kubegems/libs/utils/prometheus';
  import BasePermission from '@kubegems/mixins/permission';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapState } from 'vuex';

  import messages from '../i18n';

  export default {
    name: 'NvidiaGpuMonitor',
    i18n: {
      messages: messages,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      item: {
        type: Object,
        default: () => ({}),
      },
      type: {
        type: String,
        default: () => 'Pod',
      },
    },
    data() {
      return {
        npu: [],
        npuMemory: [],
        npuTemp: [],
        npuPower: [],
        npuFreq: [],
        npuHBMMemory: [],
        npuBandwidth: [],
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
      operator() {
        this.loadMetrics();
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    mounted() {
      this.$nextTick(async () => {
        if (this.type === 'Pod') {
          this.pods = [this.item.metadata.name];
        } else {
          await this.podList();
        }
        this.onDatetimeChange();
      });
    },
    methods: {
      async podList() {
        const data = await getPodList(this.ThisCluster, this.$route.query.namespace, {
          topkind: this.type,
          topname: this.item.metadata.name,
          size: 1000,
          noprocessing: true,
        });
        this.pods = convertResponse2List(data).map((d) => {
          return d.metadata.name;
        });
      },
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
        this.npuUsage();
        this.npuMemoryUsage();
        this.npuTempMetrics();
        this.npuPowerMetrics();
        this.npuFreqMetrics();
        this.npuHBMMemoryMetrics();
        this.npuBandWidthMetrics();
      },
      async npuUsage() {
        let query = PAI_NPU_USAGE_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query = constructPromQLByOperator(this.operator, query, this.params.start, this.params.end);
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data?.length > 0)
          data?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']}`;
          });
        if (data) this.npu = data;
      },
      async npuMemoryUsage() {
        let query1 = PAI_NPU_MEMORY_USED_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query1 = constructPromQLByOperator(this.operator, query1, this.params.start, this.params.end);
        const data1 = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query1 }));
        if (data1?.length > 0)
          data1?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']} Used`;
          });

        let query2 = PAI_NPU_MEMORY_TOTAL_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query2 = constructPromQLByOperator(this.operator, query2, this.params.start, this.params.end);
        const data2 = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query2 }));
        if (data2?.length > 0)
          data2?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']} Total`;
          });

        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);

        this.npuMemory = data;
      },
      async npuTempMetrics() {
        let query = PAI_NPU_TEMPERATURE_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query = constructPromQLByOperator(this.operator, query, this.params.start, this.params.end);
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data?.length > 0)
          data?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']}`;
          });
        if (data) this.npuTemp = data;
      },
      async npuPowerMetrics() {
        let query = PAI_NPU_POWER_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query = constructPromQLByOperator(this.operator, query, this.params.start, this.params.end);
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data?.length > 0)
          data?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']}`;
          });
        if (data) this.npuPower = data;
      },
      async npuFreqMetrics() {
        let query = PAI_NPU_FREQ_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query = constructPromQLByOperator(this.operator, query, this.params.start, this.params.end);
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data?.length > 0)
          data?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']}`;
          });
        if (data) this.npuFreq = data;
      },
      async npuHBMMemoryMetrics() {
        let query1 = PAI_NPU_HBM_MEMORY_USED_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query1 = constructPromQLByOperator(this.operator, query1, this.params.start, this.params.end);
        const data1 = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query1 }));
        if (data1?.length > 0)
          data1?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']} Used`;
          });

        let query2 = PAI_NPU_HBM_MEMORY_TOTAL_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query2 = constructPromQLByOperator(this.operator, query2, this.params.start, this.params.end);
        const data2 = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query2 }));
        if (data2?.length > 0)
          data2?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']} Total`;
          });

        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);

        this.npuHBMMemory = data;
      },
      async npuBandWidthMetrics() {
        let query1 = PAI_NPU_BANDWIDTH_RX_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query1 = constructPromQLByOperator(this.operator, query1, this.params.start, this.params.end);
        const data1 = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query1 }));
        if (data1?.length > 0)
          data1?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']} ${this.$t('tip.npu_band_width_rx')}`;
          });

        let query2 = PAI_NPU_BANDWIDTH_TX_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        query2 = constructPromQLByOperator(this.operator, query2, this.params.start, this.params.end);
        const data2 = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query2 }));
        if (data2?.length > 0)
          data2?.forEach((d) => {
            d.metric['name'] = `npu-${d.metric['id']} ${this.$t('tip.npu_band_width_tx')}`;
          });

        let data = [];
        if (data1) data = data.concat(data1);
        if (data2) data = data.concat(data2);

        this.npuBandwidth = data;
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

<style lang="scss" scoped>
  .logo {
    line-height: 28px;
    font-size: 13px;
  }
</style>
