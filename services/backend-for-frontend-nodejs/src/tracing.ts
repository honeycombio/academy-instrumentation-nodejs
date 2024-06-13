import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import * as opentelemetry from '@opentelemetry/api';
const { UndiciInstrumentation } = require('@opentelemetry/instrumentation-undici');


// opentelemetry.diag.setLogger( // INSTRUMENTATION: make it tell you when it fails to send traces
//     new opentelemetry.DiagConsoleLogger(),
//     opentelemetry.DiagLogLevel.INFO
// );

// The Trace Exporter uses environment variables for endpoint, service name, and API Key.
const traceExporter = new OTLPTraceExporter();

const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations(
        { '@opentelemetry/instrumentation-fs': { enabled: false } } // INSTRUMENTATION: remove the noisy spans that we don't use
    ),  new UndiciInstrumentation() // INSTRUMENTATION: 'fetch' needs this, and it isn't in getNodeAutoInstrumentations yet.
    ]
});

sdk.start();

console.log("Started OpenTelemetry SDK");
