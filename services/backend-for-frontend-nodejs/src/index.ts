import express, { Request, Response } from 'express';
import healthcheck from 'express-healthcheck';
import { fetchFromService } from "./internal-service-lib";
import { trace, context, ROOT_CONTEXT } from '@opentelemetry/api';

const app = express();
const PORT = 10115;

const tracer = trace.getTracer('default')
app.use(express.json());
app.use('/health', healthcheck());

app.post('/createPicture', async (req: Request, res: Response) => {
    const span = trace.getActiveSpan();
    const createPictureSpan = tracer.startSpan('create picture');
    try {
        // start an async task that takes a while but we don't want to wait for
        fetchFromService('sleep', {
            method: "GET"
        });

        // start the async tasks that we do want to wait for
        const [phraseResponse, imageResponse] = await Promise.all([
            fetchFromService('phrase-picker'),
            fetchFromService('image-picker')
        ]);
        const phraseText = phraseResponse.ok ? await phraseResponse.text() : "{}";
        const imageText = imageResponse.ok ? await imageResponse.text() : "{}";
        span?.setAttributes({ "app.phraseResponse": phraseText, "app.imageResponse": imageText }); // INSTRUMENTATION: add relevant info to span
        const phraseResult = JSON.parse(phraseText);
        const imageResult = JSON.parse(imageText);
        createPictureSpan?.setAttributes({ "app.phraseResult": phraseResult, "app.imageResult": imageResult})

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
        span?.recordException(error as Error);
        createPictureSpan?.recordException(error as Error);
        console.error('Error creating picture:', error);
        res.status(500).send('Internal Server Error');
        span?.end()
    }
    createPictureSpan.end()
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// Asyncronous function
app.get("/sleep", async (req: Request, res: Response) => {
    // get the context that was passed in but don't start anything
    const propagatedSpan = trace.getActiveSpan();
    console.log("propagated trace and span IDs: %s, %s", propagatedSpan?.spanContext().traceId, propagatedSpan?.spanContext().spanId)
    const propagatedCtx = context.active();
    // this propagated context will include all the Express startup and middlware stuff as well as the prior web calls.

    // make a link
    let options = {}
    if(propagatedSpan !== undefined){
      options = {
        links: [
            {
              context: propagatedSpan.spanContext(),
            },
          ],
      };   
    } 

    // now make a new span with a different context
    let ctx = ROOT_CONTEXT
    const newTraceRootSpan = tracer.startSpan("sleepy activity root span", options, ctx); // override the context  

    ctx = trace.setSpan(ctx, newTraceRootSpan)

    for(let i = 0; i < 5; i++){
      const childSpan = tracer.startSpan('sleepy child span', {}, ctx) 
      childSpan?.setAttributes({ "app.timePassed": i})
      console.log("time passes %d", i)
      await new Promise(resolve => setTimeout(resolve, 400)); // let some time pass.
      childSpan.end()
    }
    res.status(200).send("Awake time!\r\n")
    newTraceRootSpan?.end()
});
