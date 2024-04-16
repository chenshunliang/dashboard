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
import { SERVICE_PAI } from './namespace';

export const CLUSTER_CPU_USAGE_PROMQL = `round(sum(%gems_node_cpu_usage_cores%), 0.001) * 1000 * 1000 * 1000`;
export const CLUSTER_MEMORY_USAGE_PROMQL = `sum(%gems_node_memory_usage_bytes%)`;
export const CLUSTER_DISK_USAGE_PROMQL = `sum(%gems_node_disk_usage_bytes%)`;
export const CLUSTER_POD_RUNNING_COUNT_PROMQL = `count(%gems_pod_status{phase="Running"}%)`;
export const CLUSTER_CPU_TOTAL_PROMQL = `sum(%gems_node_cpu_total_cores%)`;
export const CLUSTER_MEMORY_TOTAL_PROMQL = `sum(%gems_node_memory_total_bytes%)`;
export const CLUSTER_DISK_TOTAL_PROMQL = `sum(%gems_node_disk_total_bytes%)`;
export const CLUSTER_POD_CAPACITY_PROMQL = `sum(%kube_node_status_capacity{resource="pods"}%)`;
export const CLUSTER_API_SERVER_SUCCESS_RATE_PROMQL = `round((sum(%gems_cluster_apiserver_qps{code!~"5.*"}%) / sum(%gems_cluster_apiserver_qps%)) * 100, 0.01) or vector(0)`;
export const CLUSTER_API_SERVER_RT_PROMQL = `%gems_cluster_apiserver_response_duration_seconds{verb!~"WATCH|CONNECT"}% * 1000 * 1000`;
export const CLUSTER_API_SERVER_QPS_PROMQL = `sum(%gems_cluster_apiserver_qps{code=~"$1"}%)`;
export const CLUSTER_ETCD_RT_PROMQL = `%gems_cluster_etcd_response_duration_seconds% * 1000 * 1000`;
export const CLUSTER_ETCD_QPS_PROMQL = `sum(%gems_cluster_etcd_qps%)`;

export const TENANT_CPU_USAGE_PROMQL = `round(sum(%gems_namespace_cpu_usage_cores{tenant="$1"}%) by (tenant), 0.001) * 1000 * 1000 * 1000`;
export const TENANT_MEMORY_USAGE_PROMQL = `sum(%gems_namespace_memory_usage_bytes{tenant="$1"}%) by (tenant)`;

export const NODE_LOAD_PROMQL = `%node_load5%`;
export const NODE_LOAD1_PROMQL = `%node_load1{node="$1"}%`;
export const NODE_LOAD5_PROMQL = `%node_load5{node="$1"}%`;
export const NODE_LOAD15_PROMQL = `%node_load15{node="$1"}%`;
export const NODE_POD_RUNNING_COUNT_PROMQL = `sum(%gems_pod_status{phase="Running"}%)by(node)`;
export const NODE_ALL_CPU_USAGE_PROMQL = `%gems_node_cpu_usage_percent%`;
export const NODE_ALL_CPU_USED_PROMQL = `%gems_node_cpu_usage_cores%`;
export const NODE_ALL_CPU_TOTAL_PROMQL = `%gems_node_cpu_total_cores%`;
export const NODE_ALL_GPU_TOTAL_PROMQL = `%gems_pod_status{pod=~"^nvidia-dcgm-.*"}% * on (pod) group_left label_replace(count(DCGM_FI_DEV_GPU_UTIL) by (Hostname), "pod", "$0", "Hostname", ".*")`;
export const NODE_ALL_GPU_USED_PROMQL = `count(%pai_job_gpu_utils%) by (node)`;
export const NODE_ALL_MEMORY_USAGE_PROMQL = `%gems_node_memory_usage_percent%`;
export const NODE_ALL_MEMORY_TOTAL_PROMQL = `%gems_node_memory_total_bytes% / 1024 / 1024 / 1024`;
export const NODE_ALL_MEMORY_USED_PROMQL = `%gems_node_memory_usage_bytes% / 1024 / 1024 / 1024`;
export const NODE_ONE_POD_RUNNING_COUNT_PROMQL = `sum(%gems_pod_status{node="$1", phase="Running"}%)`;
export const NODE_CPU_USAGE_PROMQL = `%gems_node_cpu_usage_percent{node="$1"}%`;
export const NODE_MEMORY_USAGE_PROMQL = `%gems_node_memory_usage_percent{node="$1"}%`;
export const NODE_DISK_READ_IOPS_PROMQL = `%gems_node_disk_read_iops{node="$1"}%`;
export const NODE_DISK_WRITE_IOPS_PROMQL = `%gems_node_disk_write_iops{node="$1"}%`;
export const NODE_NETWORK_IN_PROMQL = `%gems_node_network_receive_bps{node="$1"}%`;
export const NODE_NETWORK_OUT_PROMQL = `%gems_node_network_send_bps{node="$1"}%`;
export const NODE_DISK_AVAILABLE_SIZE_PROMQL = `(gems_node_disk_total_bytes{node="$1", device !~"/dev/rbd.*"} - gems_node_disk_usage_bytes{node="$1", device !~"/dev/rbd.*"})`;
export const NODE_MEMORY_BUFFER_PROMQL = `%node_memory_Buffers_bytes{node=~"$1"}%`;
export const NODE_MEMORY_CACHED_PROMQL = `%node_memory_Cached_bytes{node=~"$1"}%`;
export const NODE_MEMORY_USED_PROMQL = `%gems_node_memory_usage_bytes{node=~"$1"}%`;
export const NODE_MEMORY_TOTAL_PROMQL = `%node_memory_MemTotal_bytes{node=~"$1"}%`;

export const ENVIRONMENT_CPU_USAGE_PROMQL = `round(%gems_namespace_cpu_usage_cores{environment=~"$1"}%, 0.001) * 1000 * 1000 * 1000`;
export const ENVIRONMENT_MEMORY_USAGE_PROMQL = `round(%gems_namespace_memory_usage_bytes{environment=~"$1"}%, 0.001)`;
export const ENVIRONMENT_NETWORK_IN_PROMQL = `%gems_namespace_network_receive_bps{environment=~"$1"}%`;
export const ENVIRONMENT_NETWORK_OUT_PROMQL = `%gems_namespace_network_send_bps{environment=~"$1"}%`;

export const POD_CPU_USAGE_PROMQL = `round(sum(%gems_container_cpu_usage_cores{pod=~"$1", namespace=~"$2"}%)without(container), 0.001) * 1000 * 1000 * 1000`;
export const POD_MEMORY_USAGE_PROMQL = `round(sum(%gems_container_memory_usage_bytes{pod=~"$1", namespace=~"$2"}%)without(container) / 1024 / 1024, 0.01)`;
export const POD_NETWORK_IN_PROMQL = `round(%gems_container_network_receive_bps{pod=~"$1", namespace=~"$2"}%, 0.001)`;
export const POD_NETWORK_OUT_PROMQL = `round(%gems_container_network_send_bps{pod=~"$1", namespace=~"$2"}%, 0.001)`;
export const POD_CPU_USAGE_BY_CONTAINER_PROMQL = `round(%gems_container_cpu_usage_cores{pod=~"$1", namespace=~"$2", container!=""}%, 0.001) * 1000 * 1000 * 1000`;
export const POD_MEMORY_BY_CONTAINER_USAGE_PROMQL = `%gems_container_memory_usage_bytes{pod=~"$1", namespace=~"$2", container!=""}%`;

export const WORKLOAD_CPU_USAGE_CORE_PROMQL = `round(sum(%gems_container_cpu_usage_cores{workload=~"$1", namespace=~"$2"}%)without(container), 0.001) * 1000 * 1000 * 1000`;
export const WORKLOAD_MEMORY_USAGE_BYTE_PROMQL = `round(sum(%gems_container_memory_usage_bytes{workload=~"$1", namespace=~"$2"}%)without(container) / 1024 / 1024, 0.01)`;
export const WORKLOAD_NETWORK_IN_PROMQL = `round(%gems_container_network_receive_bps{workload=~"$1", namespace=~"$2"}%, 0.001)`;
export const WORKLOAD_NETWORK_OUT_PROMQL = `round(%gems_container_network_send_bps{workload=~"$1", namespace=~"$2"}%, 0.001)`;

export const CONTAINER_CPU_USAGE_PROMQL = `round(%gems_container_cpu_usage_cores{container=~"$1", pod=~"$2", namespace=~"$3"}%, 0.001) * 1000 * 1000 * 1000`;
export const CONTAINER_MEMORY_USAGE_PROMQL = `round(%gems_container_memory_usage_bytes{container=~"$1", pod=~"$2", namespace=~"$3"}% / 1024 / 1024, 0.01)`;

export const PVC_USAGE_PROMQL = `%gems_pvc_usage_bytes{namespace="$1",persistentvolumeclaim="$2"}%`;
export const PVC_USAGE_INODE_PROMQL = `round(gems_pvc_inode_used{namespace="$1",persistentvolumeclaim="$2"} / gems_pvc_inode_total{namespace="$1",persistentvolumeclaim="$2"} * 100, 0.01)`;

export const TOP_15_POD_CPU_MAX_PROMQL = `topk(15, round(max_over_time(sum(gems_container_cpu_usage_cores{namespace="$1"})without(container)[1d:1m]), 0.001))`;
export const TOP_15_POD_CPU_AVG_PROMQL = `topk(15, round(avg_over_time(sum(gems_container_cpu_usage_cores{namespace="$1"})without(container)[1d:1m]), 0.001))`;
export const TOP_15_POD_MEMORY_MAX_PROMQL = `topk(15, round(max_over_time(sum(gems_container_memory_usage_bytes{namespace="$1"})without(container)[1d:1m]), 0.001))`;
export const TOP_15_POD_MEMORY_AVG_PROMQL = `topk(15, round(avg_over_time(sum(gems_container_memory_usage_bytes{namespace="$1"})without(container)[1d:1m]), 0.001))`;

export const WORKLOAD_CPU_USAGE_PROMQL = `sum(%gems_container_cpu_usage_cores{namespace="$1", workload="$2"}%) * 1000`;
export const WORKLOAD_MEMORY_USAGE_PROMQL = `sum(%gems_container_memory_usage_bytes{namespace="$1", workload="$2"}%) / 1024 / 1024`;

export const GATEWAY_QPS_PROMQL = `sum(irate(nginx_ingress_controller_requests{namespace="kubegems-gateway", container="$1"}[5m]))by(ingress, host, service)`;
export const GATEWAY_CONNECTIONS_PROMQL = `sum(nginx_ingress_controller_nginx_process_connections{namespace="kubegems-gateway", container="$1"})by(state)`;

export const ISTIO_WORKLOAD_ERR_QPS_PROMQL = `sum(gems_istio_workload_request_qps{reporter="destination", destination_workload=~"$1", destination_workload_namespace="$2", request_protocol = "http", response_code =~ "4.*|5.*"} or gems_istio_workload_request_qps{reporter="destination", destination_workload=~"$1", destination_workload_namespace="$2", request_protocol="grpc", grpc_response_status !~ "0|"})`;
export const ISTIO_WORKLOAD_ERR_REQUEST_LAST_24H_PROMQL = `round(sum(increase(istio_requests_total{reporter="destination", destination_workload=~"$1", destination_workload_namespace="$2", request_protocol = "http", response_code =~ "4.*|5.*"}[24h]) or increase(istio_requests_total{reporter="destination", destination_workload=~"$1", destination_workload_namespace="$2", request_protocol="grpc", grpc_response_status !~ "0|"}[24h])), 1)`;

// TODO: P99写进recording rule
export const ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P99_PROMQL = `sum(histogram_quantile(0.99, irate(istio_request_duration_milliseconds_bucket{reporter="destination",  destination_workload="$1", destination_workload_namespace="$2"}[5m])) >= 0) / 1000`;
export const ISTIO_WORKLOAD_RESPONSE_DURATION_SECONDS_P95_PROMQL = `sum(histogram_quantile(0.95, irate(istio_request_duration_milliseconds_bucket{reporter="destination",  destination_workload="$1", destination_workload_namespace="$2"}[5m])) >= 0) / 1000`;
export const ISTIO_WORKLOAD_QPS_PROMQL = `sum(gems_istio_workload_request_qps{reporter="destination", destination_workload="$1", destination_workload_namespace="$2"} >= 0)`;
export const ISTIO_WORKLOAD_REQUEST_LAST_24H_PROMQL = `round(sum(increase(istio_requests_total{reporter="destination", destination_workload="$1", destination_workload_namespace="$2"}[24h])), 1)`;

export const ISTIO_INGRESS_GATEWAY_QPS_PROMQL = `sum(gems_istio_workload_request_qps{reporter="source", source_workload_namespace="$1", source_workload="$2"})by(destination_workload, destination_workload_namespace)`;
export const ISTIO_INGRESS_GATEWAY_REPONSE_DURATION_PROMQL = `sum(gems_istio_workload_response_duration_seconds{reporter="source", source_workload_namespace="$1", source_workload="$2"} > 0)by(destination_workload, destination_workload_namespace) * 1000 * 1000`;
export const ISTIO_INGRESS_GATEWAY_DOWNSTREAM_80_QPS_PROMQL = `sum(gems_istio_gateway_port_80_downstream_qps{namespace="$1", pod=~"$2(.*)"})by(namespace, pod)`;
export const ISTIO_INGRESS_GATEWAY_DOWNSTREAM_80_RESPONSE_DURATION_PROMQL = `gems_istio_gateway_port_80_downstream_response_duration_seconds{namespace="$1", pod=~"$2(.*)"} * 1000 * 1000`;
export const ISTIO_INGRESS_GATEWAY_DOWNSTREAM_443_QPS_PROMQL = `sum(gems_istio_gateway_port_443_downstream_qps{namespace="$1", pod=~"$2(.*)"})by(namespace, pod)`;
export const ISTIO_INGRESS_GATEWAY_DOWNSTREAM_443_RESPONSE_DURATION_PROMQL = `gems_istio_gateway_port_443_downstream_response_duration_seconds{namespace="$1", pod=~"$2(.*)"} * 1000 * 1000`;
export const ISTIO_INGRESS_NETWORK_PROMQL = `sum(gems_istio_workload_request_bps{reporter="destination",  destination_workload="$1", destination_workload_namespace="$2"} >= 0)`;
export const ISTIO_EGRESS_NETWORK_PROMQL = `sum(gems_istio_workload_response_bps{reporter="destination",  destination_workload="$1", destination_workload_namespace="$2"} >= 0)`;

export const N_GPU_USAGE_PROMQL = `round(%gems_container_gpu_usage_percent{pod=~"$1", namespace=~"$2"}%, 0.01)`;
export const N_GPU_MEMORY_USAGE_PROMQL = `round(%gems_container_gpu_memory_usage_mb{pod=~"$1", namespace=~"$2"}%, 0.001)`;
export const N_GPU_TEMP_PROMQL = `round(%gems_container_gpu_temp{pod=~"$1", namespace=~"$2"}%, 0.01)`;
export const N_GPU_POWER_PROMQL = `round(%gems_container_gpu_power_usage_watt{pod=~"$1", namespace=~"$2"}%, 0.01)`;

export const T_GPU_USAGE_PROMQL = `round(%container_gpu_utilization{pod=~"$1", namespace=~"$2"}%, 0.01)`;
export const T_GPU_MEMORY_USAGE_PROMQL = `round(%container_gpu_memory_total{pod=~"$1", namespace=~"$2"}%, 0.001)`;

export const MODEL_WORKLOAD_CPU_USAGE_CORE_PROMQL = `round(sum(%gems_container_cpu_usage_cores{pod=~"$1", namespace=~"$2"}%)without(container), 0.001) * 1000 * 1000 * 1000`;
export const MODEL_WORKLOAD_MEMORY_USAGE_BYTE_PROMQL = `sum(%gems_container_memory_usage_bytes{pod=~"$1", namespace=~"$2"}%)without(container)`;

export const PROBE_DURATION_PROMQL = `probe_duration_seconds{job='probe/$1'}`;
export const PROBE_AVG_DURATION_PROMQL = `avg_over_time(probe_duration_seconds{job="probe/$1", instance="$2"}[30m])`;
export const PROBE_MAX_DURATION_PROMQL = `max_over_time(probe_duration_seconds{job="probe/$1", instance="$2"}[30m])`;
export const PROBE_MIN_DURATION_PROMQL = `min_over_time(probe_duration_seconds{job="probe/$1", instance="$2"}[30m])`;
export const PROBE_AVAILABILITY_PROMQL = `probe_success{job="probe/$1", instance="$2"}`;
export const PROBE_HTTPS_ENABLED_PROMQL = `probe_http_ssl{job="probe/$1"}`;
export const PROBE_HTTP_VERSION_PROMQL = `probe_http_version{job="probe/$1"}`;
export const PROBE_HTTP_TLS_VERSION_PROMQL = `probe_tls_version_info{job="probe/$1"}`;
export const PROBE_HTTP_CERT_EXPIRY_PROMQL = `probe_ssl_earliest_cert_expiry{job="probe/$1"}`;

export const JUICEFS_TOTAL_BYTES_PROMQL = `round(juicefs_total_bytes{bucket=~"$1"}, 0.001)`;
export const JUICEFS_TOTAL_FILES_PROMQL = `juicefs_total_files{bucket=~"$1"}`;

export const NVIDIA_GPU_PROMQL = `sum(%pai_job_gpu_utils{pod=~"$1"}%) by (device)`;
export const NVIDIA_GPU_MEMORY_PROMQL = `sum(%pai_job_gpu_mem_utils{pod=~"$1"}%) by (device)`;
export const NVIDIA_TEMP_PROMQL = `sum(%pai_job_gpu_temp{pod=~"$1"}%) by (device)`;
export const NVIDIA_POWER_PROMQL = `sum(%pai_job_gpu_power{pod=~"$1"}%) by (device)`;
export const NVIDIA_GPU_BY_POD_PROMQL = `ceil(avg(%pai_job_gpu_utils{pod=~"$1"}%) by (pod))`;
export const NVIDIA_GPU_MEMORY_BY_POD_PROMQL = `avg(DCGM_FI_DEV_FB_USED{pod=~"$1"} / (DCGM_FI_DEV_FB_USED{pod=~"$1"} + DCGM_FI_DEV_FB_FREE{pod=~"$1"}) * 100) by (pod)`;
export const NVIDIA_GPU_MEMORY_BY_POD_TOTAL_PROMQL = `sum(DCGM_FI_DEV_FB_USED{pod=~"$1"} + DCGM_FI_DEV_FB_FREE{pod=~"$1"}) by (pod)`;

export const NVIDIA_CPU_MAX_DURATION_PROMQL = `max_over_time(pai_job_gpu_utils{pod=~"$1"}[24h])`;
export const NVIDIA_MEMORY_MAX_DURATION_PROMQL = `max_over_time(pai_job_gpu_mem_utils{pod=~"$1"}[24h])`;
export const POD_MAX_CPU_USAGE_DURATION_PROMQL = `round(sum(max_over_time(gems_container_cpu_usage_cores{pod=~"$1"}[24h]))without(container), 0.001)`;
export const POD_MAX_MEMORY_USAGE_DURATION_PROMQL = `sum(max_over_time(gems_container_memory_usage_bytes{pod=~"$1"}[24h]))without(container)`;
export const POD_AVG_CPU_USAGE_DURATION_PROMQL = `round(sum(avg_over_time(gems_container_cpu_usage_cores{pod=~"$1"}[24h]))without(container), 0.001)`;
export const POD_AVG_MEMORY_USAGE_DURATION_PROMQL = `sum(avg_over_time(gems_container_memory_usage_bytes{pod=~"$1"}[24h]))without(container)`;

export const PAI_SET_COUNT_PROMQL = `count(%pai_storageset_total_files{tenant=~"$1"}%) by (storageset_kind)`;
export const PAI_SET_FILES_PROMQL = `sum(%pai_storageset_total_files{tenant=~"$1"}%) by (storageset_kind)`;
export const PAI_SET_CAPABILITY_PROMQL = `sum(%pai_storageset_total_capability{tenant=~"$1"}%) by (storageset_kind)`;
export const PAI_SET_PROMQL = `%pai_storageset_total_files{tenant=~"$1", storageset_kind=~"$2"}%`;
export const PAI_SET_COUNT_TOTAL_PROMQL = `count(%pai_storageset_total_files{tenant=~"$1", storageset_kind=~"workspace|dataset|modelset"}%)`;
export const PAI_JOB_COUNT_PROMQL = `count(%pai_job_info{phase="Running", tenant=~"$1"}%)`;
export const PAI_JOB_COUNT_GPU_PROMQL = `count(%pai_job_gpu_utils{phase="Running", tenant=~"$1"}%)`;
export const PAI_JOB_USAGE_CPU_PROMQL = `sum(%gems_container_cpu_usage_cores{pod=~"^$1-.*", owner_kind="Job", namespace="${SERVICE_PAI}"}%)`;
export const PAI_JOB_USAGE_MEMORY_PROMQL = `round(sum(%gems_container_memory_usage_bytes{pod=~"^$1-.*", owner_kind="Job", namespace="${SERVICE_PAI}"}%)/1024,0.001)`;

export const PAI_SET_FILES_BY_USER_PROMQL = `sort_desc(sum(pai_storageset_total_files{tenant=~"$1", storageset_kind="$2"}) by (user))`;
export const PAI_SET_CAPABILITY_BY_USER_PROMQL = `sort_desc(sum(pai_storageset_total_capability{tenant=~"$1", storageset_kind="$2"}) by (user))`;
export const PAI_SET_COUNT_BY_USER_PROMQL = `sort_desc(count(pai_storageset_total_files{tenant=~"$1", storageset_kind="$2"}) by (user))`;
export const PAI_SET_TOP_FILES_PROMQL = `topk(10, pai_storageset_total_files{tenant=~"$1", storageset_kind="$2"})`;
export const PAI_SET_TOP_CAPABILITY_PROMQL = `topk(10, pai_storageset_total_capability{tenant=~"$1", storageset_kind="$2"})`;

export const PAI_SET_FILES_BY_CLUSTER_PROMQL = `sum(%pai_storageset_total_files%) by (storageset_kind)`;
export const PAI_SET_COUNT_BY_CLUSTER_PROMQL = `count(%pai_storageset_total_files%) by (storageset_kind)`;
export const PAI_SET_CAPABILITY_BY_CLUSTER_PROMQL = `sum(%pai_storageset_total_capability%) by (storageset_kind)`;

export const PAI_SET_FILES_TENANT_PROMQL = `sort_desc(sum(%pai_storageset_total_files%) by (tenant))`;
export const PAI_SET_CAPABILITY_TENANT_PROMQL = `sort_desc(sum(%pai_storageset_total_capability%) by (tenant))`;

export const PAI_SET_FILES_BY_TENANT_PROMQL = `sort_desc(sum(%pai_storageset_total_files{storageset_kind="$1"}%) by (tenant))`;
export const PAI_SET_CAPABILITY_BY_TENANT_PROMQL = `sort_desc(sum(%pai_storageset_total_capability{storageset_kind="$1"}%) by (tenant))`;
export const PAI_SET_COUNT_BY_TENANT_PROMQL = `sort_desc(count(%pai_storageset_total_files{storageset_kind="$1"}%) by (tenant))`;
export const PAI_SET_TOP_FILES_BY_CLUSTER_PROMQL = `topk(10, pai_storageset_total_files{storageset_kind="$1"})`;
export const PAI_SET_TOP_CAPABILITY_BY_CLUSTER_PROMQL = `topk(10, pai_storageset_total_capability{storageset_kind="$1"})`;

export const PAI_JOB_USAGE_CPU_BY_CLUSTER_PROMQL = `sum(%gems_container_cpu_usage_cores{owner_kind="Job", namespace="${SERVICE_PAI}"}%)`;
export const PAI_JOB_USAGE_MEMORY_BY_CLUSTER_PROMQL = `round(sum(%gems_container_memory_usage_bytes{owner_kind="Job", namespace="${SERVICE_PAI}"}%)/1024,0.001)`;
export const PAI_JOB_COUNT_BY_CLUSTER_PROMQL = `count(%pai_job_info{phase="Running"}%)`;
export const PAI_JOB_COUNT_GPU_BY_CLUSTER_PROMQL = `count(%pai_job_gpu_utils{phase="Running"}%)`;

export const PAI_JOB_USAGE_CPU_BY_POD_PROMQL = `sum(%gems_container_cpu_usage_cores{owner_kind="Job", namespace="${SERVICE_PAI}", pod=~"$1"}%) by (pod)`;
export const PAI_JOB_USAGE_MEMORY_BY_POD_PROMQL = `sum(%gems_container_memory_usage_bytes{owner_kind="Job", namespace="${SERVICE_PAI}", pod=~"$1"}%) by (pod)`;
export const PAI_JOB_NVIDIA_GPU_BY_POD_PROMQL = `%pai_job_gpu_utils{pod=~"$1"}%`;
export const PAI_JOB_NVIDIA_GPU_MEMORY_BY_POD_PROMQL = `avg(DCGM_FI_DEV_FB_USED{pod=~"$1"} / (DCGM_FI_DEV_FB_USED{pod=~"$1"} + DCGM_FI_DEV_FB_FREE{pod=~"$1"}) * 100) by (device, pod)`;
export const PAI_JOB_USAGE_CPU_BY_NODE_PROMQL = `sum(%gems_container_cpu_usage_cores{owner_kind="Job", namespace="${SERVICE_PAI}"}%) by (node)`;
export const PAI_JOB_USAGE_MEMORY_BY_NODE_PROMQL = `sum(%gems_container_memory_usage_bytes{owner_kind="Job", namespace="${SERVICE_PAI}"}%) by (node)`;
export const PAI_JOB_NODE_RESOURCE_REQUEST_PROMQL = `sum(%kube_pod_container_resource_requests%) by (node, resource, unit)`;

export const PAI_STORAGE_TRAFFIC = `round(sum_over_time(juicefs_s3_input_bytes{bucket=~"$1"}[24h]), 0.001)`;
export const PAI_STORAGE_REQUEST = `round(sum_over_time(juicefs_s3_request_count{bucket=~"$1"}[24h]), 0.001)`;
