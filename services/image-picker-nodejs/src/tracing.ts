import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { ConfigurationSpanProcessor } from './config';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// The Trace Exporter exports the data to Honeycomb and uses
// environment variables for endpoint, service name, and API Key.
const traceExporter = new OTLPTraceExporter();

const sdk = new NodeSDK({
    // traceExporter, // when you have spanProcessors, this is ignored! Add it to the processors, inside a BatchSpanProcessor.
    spanProcessors: [new ConfigurationSpanProcessor(), new BatchSpanProcessor(traceExporter)],
    instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();

console.log("Started OpenTelemetry SDK in image-picker");

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
