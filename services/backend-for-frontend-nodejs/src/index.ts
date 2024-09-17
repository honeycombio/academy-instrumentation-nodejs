// import { trace, context, ROOT_CONTEXT, SpanStatusCode } from '@opentelemetry/api'; // Import modules from OTel
// Step 1 Add Span Attributes and Step 1 Create Custom Spans. Import trace module
// Step 3 Create New Traces. Add ROOT_CONTEXT
// Step 1 Add Span Status. Add SpanStatusCode
// import "./tracing" // Step 4 Auto Instrumentation. Import tracing file 
import express, { Request, Response } from 'express';
import healthcheck from 'express-healthcheck';
import { fetchFromService } from "./internal-service-lib";

const app = express();
const PORT = 10115;
// const tracer = trace.getTracer('default') // Step 2 Create Custom Spans. Get tracer to create new span from tracer

app.use(express.json());
app.use('/health', healthcheck());

app.post('/createPicture', async (req: Request, res: Response) => {
    // const span = trace.getActiveSpan(); // Step 2 Add Span Attributes. Create a span
    // const createPictureSpan = tracer.startSpan('create picture'); // Step 3 Create Custom Spans. Create mew span on current tracer

    // TS error type helper function
    // const getErrorMessage = (error: unknown) => {
    //     if(error instanceof Error) error.message
    //     return "some error that is not an Error" + String(error)
    // }

    try {
        //    createPictureSpan.addEvent('log-event', {'log.message': 'Picture successfully created'}); // Step 2 Create Span Events. Add span event to capture log event with custom message
        // Step 5 Create New Trace. To create span link, create options cariable that contains link to other spans
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
    
            // tracer.startActiveSpan("sleepy activity root span", {}, ROOT_CONTEXT, (span) => { // Step 4 Create New Traces. Wrap in place fetch from service call
            // Step 5 Create New Trace. To create span link, above line modify by adding options variable in the curly braces
            // tracer.startActiveSpan("sleepy activity root span", {}, ROOT_CONTEXT, (span) => {
            // fetchFromService('sleep', { // Step 2 Create New Trace. Add function call to async function.
            //     method: "GET"
            // });
            // span.end() // Step 4 Create New Traces. End the span
           // });

        const [phraseResponse, imageResponse] = await Promise.all([
            fetchFromService('phrase-picker'),
            fetchFromService('image-picker')
        ]);
        const phraseText = phraseResponse.ok ? await phraseResponse.text() : "{}";
        const imageText = imageResponse.ok ? await imageResponse.text() : "{}";
        // span?.setAttributes({ "app.phraseResponse": phraseText, "app.imageResponse": imageText }); // Step 3 Add Span Attributes. Set attributes
        const phraseResult = JSON.parse(phraseText);
        const imageResult = JSON.parse(imageText);
        // createPictureSpan?.setAttributes({ "app.phraseResult": phraseResult, "app.imageResult": imageResult}) // Step 5 Create New Spans. Add span attributes
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
        // span?.end() // Step 4 Add Span Attributes. End the span you created
        res.end()

    } catch (error) {
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR }); // Step 1 of set status to set status to error when code hits catch block
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message }); // Step 2 of set status to capture message
        // createPictureSpan.recordException(error as Error); // Step 3 of set status to record exception

        // if (error instanceof Error) { 
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: error.message }) 
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message }); 
        // createPictureSpan.recordException(error as Error); 

    
        // createPictureSpan.addEvent('error-event', { error: (error as Error).message }); // Step 3 Create Span Events. Set span status to error then capture as span event
        // to handle TS type safety
        // if (error instanceof Error) {
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
        // createPictureSpan.recordException(error)
    // } else {
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: "some non-error message" + error })
// }
        console.error('Error creating picture:', error);
        res.status(500).send('Internal Server Error');
    }
    // createPictureSpan.end() // Step 4 Create Custom Spans. End the span
 });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Step 1 Create New Trace. Asynchronous fuction for creating a custom span with a new trace. Remove comment to use this as helpder function to create async tasks.
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