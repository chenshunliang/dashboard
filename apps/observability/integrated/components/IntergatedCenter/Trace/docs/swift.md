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

## Swift Trace

OpenTelmetry Swift SDK 中的 Swift 尚处于早期阶段，暂不提供接入文档

以下是一个官方的 Trace 样例

```swift
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import Foundation
import OpenTelemetryProtocolExporter
import OpenTelemetryApi
import OpenTelemetrySdk
import ResourceExtension
import StdoutExporter
import ZipkinExporter
import SignPostIntegration
import GRPC
import NIO
import NIOSSL

let sampleKey = "sampleKey"
let sampleValue = "sampleValue"

var resources = DefaultResources().get()

let instrumentationLibraryName = "OTLPExporter"
let instrumentationLibraryVersion = "semver:0.1.0"
var instrumentationLibraryInfo = InstrumentationLibraryInfo(name: instrumentationLibraryName, version: instrumentationLibraryVersion)

var tracer: TracerSdk
tracer = OpenTelemetrySDK.instance.tracerProvider.get(instrumentationName: instrumentationLibraryName, instrumentationVersion: instrumentationLibraryVersion) as! TracerSdk

let configuration = ClientConnection.Configuration(
    target: .hostAndPort("opentelemetry-collector.observability", 4317),
    eventLoopGroup: MultiThreadedEventLoopGroup(numberOfThreads: 1)
)
let client = ClientConnection(configuration: configuration)

let otlpTraceExporter = OtlpTraceExporter(channel: client)
let stdoutExporter = StdoutExporter()
let spanExporter = MultiSpanExporter(spanExporters: [otlpTraceExporter, stdoutExporter])

let spanProcessor = SimpleSpanProcessor(spanExporter: spanExporter)
OpenTelemetrySDK.instance.tracerProvider.addSpanProcessor(spanProcessor)

if #available(macOS 10.14, *) {
    OpenTelemetrySDK.instance.tracerProvider.addSpanProcessor(SignPostIntegration())
}

func createSpans() {
    let parentSpan1 = tracer.spanBuilder(spanName: "Main").setSpanKind(spanKind: .client).startSpan()
    parentSpan1.setAttribute(key: sampleKey, value: sampleValue)
    OpenTelemetry.instance.contextProvider.setActiveSpan(parentSpan1)
    for _ in 1...3 {
        doWork()
    }
    Thread.sleep(forTimeInterval: 0.5)

    let parentSpan2 = tracer.spanBuilder(spanName: "Another").setSpanKind(spanKind: .client).setActive(true).startSpan()
    parentSpan2.setAttribute(key: sampleKey, value: sampleValue)
    // do more Work
    for _ in 1...3 {
        doWork()
    }
    Thread.sleep(forTimeInterval: 0.5)

    parentSpan2.end()
    parentSpan1.end()
}

func doWork() {
    let childSpan = tracer.spanBuilder(spanName: "doWork").setSpanKind(spanKind: .client).startSpan()
    childSpan.setAttribute(key: sampleKey, value: sampleValue)
    Thread.sleep(forTimeInterval: Double.random(in: 0..<10)/100)
    childSpan.end()
}

// Create a Parent span (Main) and do some Work (child Spans). Repeat for another Span.
createSpans()

//Metrics
let otlpMetricExporter = OtlpMetricExporter(channel: client)
let processor = MetricProcessorSdk()
let meterProvider = MeterProviderSdk(metricProcessor: processor, metricExporter: otlpMetricExporter, metricPushInterval: 0.1)

var meter = meterProvider.get(instrumentationName: "otlp_example_meter'")
var exampleCounter = meter.createIntCounter(name: "otlp_example_counter")
var exampleMeasure = meter.createIntMeasure(name: "otlp_example_measure")
var exampleObserver = meter.createIntObserver(name: "otlp_example_observation") { observer in
    var taskInfo = mach_task_basic_info()
    var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4
    let _: kern_return_t = withUnsafeMutablePointer(to: &taskInfo) {
        $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
            task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
        }
    }
    labels1 = ["dim1": "value1"]
    observer.observe(value: Int(taskInfo.resident_size), labels: labels1)
}

var labels1 = ["dim1": "value1"]
for _ in 1...3000 {
    exampleCounter.add(value: 1, labelset: meter.getLabelSet(labels: labels1))
    exampleMeasure.record(value: 100, labelset: meter.getLabelSet(labels: labels1))
    exampleMeasure.record(value: 500, labelset: meter.getLabelSet(labels: labels1))
    exampleMeasure.record(value: 5, labelset: meter.getLabelSet(labels: labels1))
    exampleMeasure.record(value: 750, labelset: meter.getLabelSet(labels: labels1))
    sleep(1)
}
```

更多可参阅 [OpenTelemetry Swift SDK](https://github.com/open-telemetry/opentelemetry-swift)

样例可参阅 [[OpenTelemetry Swift SDK Examples](https://github.com/open-telemetry/opentelemetry-swift/tree/main/Examples)

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
