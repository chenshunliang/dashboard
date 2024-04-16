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

## Nodejs Trace

Node.js 支持在 http、https、grpc、express、mysql、mongodb、redis 等框架中通过引入依赖包的方式自动上传 Trace 数据。详细的框架列表请参见[opentelemetry-node-js-contrib](https://github.com/open-telemetry/opentelemetry-js-contrib)。此处以 express 为例，介绍 opentelemetry 的自动接入方案。更多示例请参见[examples](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/examples)。

#### step 1 安装依赖包

```
npm install --save @opentelemetry/api
npm install --save @opentelemetry/node
npm install --save @opentelemetry/tracing
npm install --save @opentelemetry/exporter-collector-grpc
npm install --save @opentelemetry/instrumentation
npm install --save @opentelemetry/instrumentation-express
npm install --save @opentelemetry/instrumentation-http
npm install --save @grpc/grpc-js
npm install --save @opentelemetry/sdk-trace-node
```

#### step 2 初始化 Tracer 并启动 express

```javascript
import opentelemetry from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/tracing';
import grpc from '@grpc/grpc-js';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector-grpc';

import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import express from 'express';

import os from 'os';
var hostname = os.hostname();

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'your-nodejaApp',
  }),
});
provider.register();

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation({
      ignoreLayersType: [new RegExp('middleware.*')],
    }),
  ],
  tracerProvider: provider,
});

var url = 'opentelemetry-collector.observability:4317';

var logStdout = false;
if (url == 'stdout') {
  logStdout = true;
}
const collectorOptions = {
  url: url,
  credentials: grpc.credentials.createSsl(),
};
const exporter = new CollectorTraceExporter(collectorOptions);

if (!logStdout) {
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
} else {
  var stdexporter = new ConsoleSpanExporter();
  provider.addSpanProcessor(new SimpleSpanProcessor(stdexporter));
}
provider.register();
var tracer = opentelemetry.trace.getTracer('your-nodejsApp');

var app = express();

app.get('/hello', function (req, res, next) {
  res.send('success');
});

var server = app.listen(8079, function () {
  var port = server.address().port;
});
```

更多请参阅 [OpenTelemetry Nodejs SDK](https://www.npmjs.com/package/@opentelemetry/sdk-metrics-base)

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
