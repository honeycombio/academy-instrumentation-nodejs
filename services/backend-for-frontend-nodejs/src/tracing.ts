// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import * as opentelemetry from '@opentelemetry/api';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
// For adding resource attributes
// import { Resource } from '@opentelemetry/resources'
// import { 
//   SEMRESATTRS_SERVICE_NAMESPACE,
//   SEMRESATTRS_SERVICE_VERSION,
//   SEMRESATTRS_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions';

opentelemetry.diag.setLogger(
    new opentelemetry.DiagConsoleLogger(),
    opentelemetry.DiagLogLevel.INFO
);

// The Trace Exporter exports the data to Honeycomb and uses
// environment variables for endpoint, service name, and API Key.
const traceExporter = new OTLPTraceExporter();

const sdk = new NodeSDK({
// Inject resource attributes
    // resource: new Resource ({
    //   [ SEMRESATTRS_SERVICE_NAMESPACE ]: "yourNameSpace",
    //   [ SEMRESATTRS_SERVICE_VERSION ]: "1.0",
    //   [ SEMRESATTRS_SERVICE_INSTANCE_ID ]: "my-instance-id-1",
    // }),
    traceExporter,
    // spanProcessors: [new ConfigurationSpanProcessor(), new BatchSpanProcessor(traceExporter)], // INSTRUMENTATION: report global configuration on every span
    instrumentations: [getNodeAutoInstrumentations(
        // { '@opentelemetry/instrumentation-fs': { enabled: false } } // the fs tracing might be interesting here!
    ), new UndiciInstrumentation()] // 'fetch' is used to download the file
});

sdk.start();

console.log("Started OpenTelemetry SDK");
