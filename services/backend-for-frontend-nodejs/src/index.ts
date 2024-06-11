import "./tracing"
import express, { Request, Response } from 'express';
import { fetchFromService } from "./o11yday-lib";
import { trace } from '@opentelemetry/api';

const app = express();
const PORT = 10114;
const tracer = trace.getTracer('default')
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
    res.send({ message: "I am here", status_code: 0 });
});

app.post('/createPicture', async (req: Request, res: Response) => {
    // const span = trace.getActiveSpan();
    // const createPictureSpan = tracer.startSpan('create picture');
    try {
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
        // createPictureSpan?.recordException(error as Error);
        console.error('Error creating picture:', error);
        res.status(500).send('Internal Server Error');
    }
    // createPictureSpan.end()
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
