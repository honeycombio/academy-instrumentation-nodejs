// Answer Key Directions
// The Instrumenting with Node.js Using OpenTelemetry course on Honeycomb Academy gives you instructions on making code changes to this respository to implement instrumentation to the backend-for-frontend service. 
// The code changes are commented out. 
// Each code change includes a reference back to the activity in the course that contains instructions for the code change.

// import { trace, context, ROOT_CONTEXT, SpanStatusCode } from '@opentelemetry/api'; // // Step 1 of Add Span Attributes and Step 1 of Create Custom Spans in a Current Trace. Import trace module at the TOP of index.ts file. This step is the same for both activities, so if you've already completed Add Span Attributes and are working on Create Custom Spans in Current Traces, you will already see the trace module imported. No changes are needed
// Step 3 of Create New Traces. Add ROOT_CONTEXT to import statement above
// Step 1 of Add Span Statuses. Add SpanStatusCode to import statement above
// import "./tracing" // Step 4 of Automatic Instrumentation with OpenTelemetry for a Node.js Service. Import tracing.ts file
import express, { Request, Response } from 'express';
import healthcheck from 'express-healthcheck';
import { fetchFromService } from "./internal-service-lib";

const app = express();
const PORT = 10115;
// const tracer = trace.getTracer('default') // Step 2 of Create Custom Spans in a Current Trace. Get tracer in order to create new span from tracer

app.use(express.json());
app.use('/health', healthcheck());

app.post('/createPicture', async (req: Request, res: Response) => {
    // const span = trace.getActiveSpan(); // Step 2 of Add Span Attributes. Create a span to add attributes to
    // const createPictureSpan = tracer.startSpan('create picture'); // Step 3 of Create Custom Spans in a Current Trace. Create new span on the current tracer

    // TS error type helper function
    // const getErrorMessage = (error: unknown) => {
    //     if(error instanceof Error) error.message
    //     return "some error that is not an Error" + String(error)
    // }

    try {
        //    createPictureSpan.addEvent('log-event', {'log.message': 'Picture successfully created'}); // Step 2 of Create Span Events. Add span event to capture log event with custom message
        // Step 5 of Create New Traces, when you create a span link. To create span link, create options variable that contains link to other spans
        //     let options = {}
        //    if(createPictureSpan !== undefined){
        //        options = {
        //            links: [
        //                {
        //                context: createPictureSpan.spanContext(),
        //                },
        //            ],
        //        };  
        //    }
    
            // tracer.startActiveSpan("sleepy activity root span", {}, ROOT_CONTEXT, (span) => { // Step 4 of Create New Traces. Wrap in place the fetchFromService call
            // Step 5 of Create New Traces. To create span link, modify the above line by adding the options variable inside the curly braces. See line below for the final edit
            // tracer.startActiveSpan("sleepy activity root span", options, ROOT_CONTEXT, (span) => {
            // Step 2 of Create New Traces. Add function call to async function
            // fetchFromService('sleep', { 
            //     method: "GET"
            // });
            // span.end() // Step 4 of Create New Traces. End the span
           // });

        const [phraseResponse, imageResponse] = await Promise.all([
            fetchFromService('phrase-picker'),
            fetchFromService('image-picker')
        ]);
        const phraseText = phraseResponse.ok ? await phraseResponse.text() : "{}";
        const imageText = imageResponse.ok ? await imageResponse.text() : "{}";
        // span?.setAttributes({ "app.phraseResponse": phraseText, "app.imageResponse": imageText }); // Step 3 of Add Span Attributes. Set attributes on ths span
        const phraseResult = JSON.parse(phraseText);
        const imageResult = JSON.parse(imageText);
        // createPictureSpan?.setAttributes({ "app.phraseResult": phraseResult, "app.imageResult": imageResult}) // Step 5 of Create New Spans. Add span attributes once the new span is created
        const response = await fetchFromService('meminator', {
            method: "POST",
            body: {
                ...phraseResult, ...imageResult
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch picture from meminator: ${response.status} ${response.statusText}`);
        }
        if (response.body === null) {
            throw new Error(`Failed to fetch picture from meminator: ${response.status} ${response.statusText}`);
        }

        res.contentType('image/png');
        // Read the response body as binary data
        const reader = response.body.getReader();
        // Stream the chunks of the picture data to the response as they are received
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            res.write(value);
        }
        // span?.end() // Step 4 of Add Span Attributes. End the span you created
        res.end()

    } catch (error) {
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR }); // Step 1 of Add Span Statuses. Set status to error when code hits catch block
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message }); // Step 2 of Add Span Statuses. Include capture message
        // createPictureSpan.recordException(error as Error); // Step 3 of Add Span Statuses. Record exception
    
        // createPictureSpan.addEvent('error-event', { error: (error as Error).message }); // Step 3 of Create Span Events. Set span status to error then capture as span event

        // to handle TS type safety for adding span statuses
        // if (error instanceof Error) {
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
        // createPictureSpan.recordException(error)
    // } else {
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: "some non-error message" + error })
// }
        console.error('Error creating picture:', error);
        res.status(500).send('Internal Server Error');
    }
    // createPictureSpan.end() // Step 4 of Create Custom Spans. End the span
 });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Step 1 of Create New Traces. This is the asynchronous fuction for creating a custom span with a new trace. Remove comment to use this as helper function to create async tasks
//   app.get("/sleep", async (req: Request, res: Response) => {
//     for(let i = 0; i < 5; i++){
//         const childSpan = tracer.startSpan('sleepy child span') 
//         childSpan?.setAttributes({ "app.timePassed": i})
//         console.log("time passes %d", i)
//         await new Promise(resolve => setTimeout(resolve, 400)); // let some time pass.
//         childSpan.end()
//    }
//     res.status(200).send("Awake time!\r\n")
//   });