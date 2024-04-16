<BaseAlertTip message="在使用前请联系集群管理员开启 KubeGems Observability 相关的组件。" />

## KubeGems OpenTelemetry Collector

修改应用 SDK 中的 Exporter Endpoint 地址为 opentelemetry-collector.observability: `<port>`。 其中， opentelemetry-collector 是 Collector 的 Service 名称，observability 是 Collector 所在命名空间，不同上报协议对应端口如下:

| Receivers |  Protocols  | Port  |
| :-------: | :---------: | :---: |
|   otlp    |    gRPC     | 4317  |
|   otlp    |    http     | 4318  |
|  jaeger   |    gRPC     | 14250 |
|  jaeger   | thrift_http | 14268 |
|  zipkin   |             | 9411  |

## Java Trace with Agent

#### step 1 下载 Agent

[opentelemetry-javaagent.jar](https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar)

#### step2 设置 java 启动参数

```
java -javaagent:<path/to/opentelemetry-javaagent.jar> \
     -Dotel.exporter.otlp.endpoint=http://opentelemetry-collector.observability:4318 \
     -Dotel.service.name=java-opentelemetry-otlp-instrumentation
     -jar myapp.jar
```

| System property | Environment variable | Description |
| --- | --- | --- |
| otel.traces.exporter=otlp (default) | OTEL_TRACES_EXPORTER=otlp | Select the OpenTelemetry exporter for tracing (default) |
| otel.metrics.exporter=otlp | OTEL_METRICS_EXPORTER=otlp | Select the OpenTelemetry exporter for metrics (default) |
| otel.logs.exporter=otlp | OTEL_LOGS_EXPORTER=otlp | Select the OpenTelemetry exporter for logs |
| otel.exporter.otlp.endpoint | OTEL_EXPORTER_OTLP_ENDPOINT | The OTLP traces, metrics, and logs endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. If protocol is `http/protobuf` the version and signal will be appended to the path (e.g. `v1/traces`, `v1/metrics`, or `v1/logs`). Default is `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/{signal}` when protocol is `http/protobuf`. |
| otel.exporter.otlp.traces.endpoint | OTEL_EXPORTER_OTLP_TRACES_ENDPOINT | The OTLP traces endpoint to connect to. Must be a URL with a scheme of either `http` or `https` based on the use of TLS. Default is `http://localhost:4317` when protocol is `grpc`, and `http://localhost:4318/v1/traces` when protocol is `http/protobuf`. |
| otel.service.name | OTEL_SERVICE_NAME | Specify logical service name. Takes precedence over service.name defined with otel.resource.attributes |
| otel.exporter.otlp.headers | OTEL_EXPORTER_OTLP_HEADERS | Key-value pairs separated by commas to pass as request headers on OTLP trace, metric, and log requests. |
| otel.traces.sampler | OTEL_TRACES_SAMPLER | The sampler to use for tracing. Defaults to `parentbased_always_on` |
| otel.traces.sampler.arg | OTEL_TRACES_SAMPLER_ARG | An argument to the configured tracer if supported, for example a ratio. |

> 更多 java sdk 的配置参考[OpenTelemetry Java SDK Configuration](https://github.com/open-telemetry/opentelemetry-java/blob/main/sdk-extensions/autoconfigure/README.md#otlp-exporter-both-span-and-metric-exporters)

#### Step3 登录 kubegems 指标观测性并查看调用链接

## Java Trace Manual

更多请参阅请 [OpenTelemetry Java SDK](https://opentelemetry.io/docs/instrumentation/java/manual/)

---

## OpenTelemetry SDK Configuration

| Environment variable | Default value | Description |
| --- | --- | --- |
| OTEL_SERVICE_NAME | unknown_service | 设置服务名 `service.name` |
| OTEL_RESOURCE_ATTRIBUTES | Empty | 用作资源属性的键值对。有关更多详细信息，请参阅 [Resource SDK](https://opentelemetry.io/docs/reference/specification/resource/sdk/#specifying-resource-information-via-an-environment-variable) |
| OTEL_TRACES_SAMPLER | parentbased_always_on | 指定 SDK 用于采样跟踪的采样器, 支持 `always_on`、`always_off`、`traceidratio`、`parentbased_always_on`、`parentbased_always_off`、`parentbased_traceidratio`、`parentbased_jaeger_remote`、`jaeger_remote` 或者 `xray` |
| OTEL_TRACES_SAMPLER_ARG | Empty | 仅当设置 OTEL_TRACES_SAMPLER 时，才会使用指定的值。每个采样器类型都定义了自己的预期输入（如果有的话）。无效或无法识别的输入记录为错误, 请参阅[otel_traces_sampler_arg](https://opentelemetry.io/docs/concepts/sdk-configuration/general-sdk-configuration/#otel_traces_sampler_arg) |
| OTEL_PROPAGATORS | b3 | 指定在逗号分隔列表中使用的传播器, 支持 `tracecontext`、`baggage`、`b3`、`b3multi`、`jaeger`、`xray`、`ottrace` 或者 `none` |
| OTEL_TRACES_EXPORTER | otlp | 指定用于 trace 的 exporter |
| OTEL_METRICS_EXPORTER | otlp | 指定用于 metrics 的 exporter,支持 `otlp`、`prometheus` 或者 `none` |
| OTEL_LOGS_EXPORTER | otlp | 指定用于 log 的 exporter,支持 `otlp` 或者 `none` |

## OpenTelemetry Exporter Configuration

| Environment variable | Default value | Description |
| --- | --- | --- |
| OTEL_EXPORTER_OTLP_ENDPOINT | gRPC: "http://localhost:4317" <br /> HTTP: "http://localhost:4318" | 配置 OTEL Collector 地址 |
| OTEL_EXPORTER_OTLP_PROTOCOL | 通常有 SDK 实现，通常是 `http/protobuf` 或者 `grpc` | 指定用于所有遥测数据的 OTLP 传输协议 |
| OTEL_EXPORTER_OTLP_HEADERS | N/A | 允许您将配置为键值对以添加到的 gRPC 或 HTTP 请求头中 |
| OTEL_EXPORTER_OTLP_TIMEOUT | 10000(10s) | 所有上报数据（traces、metrics、logs）的超时值，单位 ms |
