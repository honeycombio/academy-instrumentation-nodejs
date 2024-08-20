import './tracing'
import express, { Request, Response } from 'express';
import healthcheck from 'express-healthcheck';
import { fetchFromService } from "./internal-service-lib";
// import { trace, SpanStatusCode } from '@opentelemetry/api';

const app = express();
const PORT = 10115;

// const tracer = trace.getTracer('default')

app.use(express.json());
app.use('/health', healthcheck());

app.post('/createPicture', async (req: Request, res: Response) => {
    // const span = trace.getActiveSpan();
    // const createPictureSpan = tracer.startSpan('create picture');

    // TS error type helper function
    // const getErrorMessage = (error: unknown) => {
    //     if(error instanceof Error) error.message
    //     return "some error that is not an Error" + String(error)
    // }

    try {
        // createPictureSpan.addEvent('log-event', {message: 'Picture was successfully create'})
        // For async new traces: make a link for an async task that we don't want to wait for
        // let options = {}
        // if(createPictureSpan !== undefined){
        //     options = {
        //         links: [
        //             {
        //             context: createPictureSpan.spanContext(),
        //             },
        //         ],
        //     };   
        // }
        
        // // call the async task with a separate span from ROOT_CONTEXT
        // tracer.startActiveSpan("sleepy activity root span", options, ROOT_CONTEXT, (span) => {
        //     fetchFromService('sleep', {
        //         method: "GET"
        //     });
        //     span.end()
        // });

        // For async new traces: start the async tasks that we do want to wait for
        const [phraseResponse, imageResponse] = await Promise.all([
            fetchFromService('phrase-picker'),
            fetchFromService('image-picker')
        ]);
        const phraseText = phraseResponse.ok ? await phraseResponse.text() : "{}";
        const imageText = imageResponse.ok ? await imageResponse.text() : "{}";
        // span?.setAttributes({ "app.phraseResponse": phraseText, "app.imageResponse": imageText }); // INSTRUMENTATION: add relevant info to span
        const phraseResult = JSON.parse(phraseText);
        const imageResult = JSON.parse(imageText);
        // createPictureSpan?.setAttributes({ "app.phraseResult": phraseResult, "app.imageResult": imageResult})

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
        res.end()

    } catch (error) {
        // span?.recordException(error as Error);
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR }) // Step 1 of set status 
        // createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message }) // Step 2 of set status
        // createPictureSpan.recordException(error as Error) // Step 3 of set status
        // createPictureSpan.addEvent('error-event', { error: (error as Error).message }); // create span event for error

        // Best practice to handle TS type safety
        // if (error instanceof Error) {
        //     createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: error.message }) // Step 2 of set status
        //     createPictureSpan.recordException(error) // Step 3 of set status
        // } else {
        //     createPictureSpan.setStatus({ code: SpanStatusCode.ERROR, message: "some non-error message" + error })
        // }

        console.error('Error creating picture:', error);
        res.status(500).send('Internal Server Error');
    }
    // createPictureSpan.end()
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Asynchronous function for creating a custom span with a new trace.
// app.get("/sleep", async (req: Request, res: Response) => {
//     for(let i = 0; i < 5; i++){
//         const childSpan = tracer.startSpan('sleepy child span') 
//         childSpan?.setAttributes({ "app.timePassed": i})
//         console.log("time passes %d", i)
//         await new Promise(resolve => setTimeout(resolve, 400)); // let some time pass.
//         childSpan.end()
//     }
//     res.status(200).send("Awake time!\r\n")
// });