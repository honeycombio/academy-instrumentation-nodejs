
# Honeycomb Academy Meminator

This contains a sample application for use in Honeycomb Academy activities.

It generates images by combining a randomly chosen picture with a randomly chosen phrase.

## Direction Set

1. Hello! Welcome to the **Instrumenting with Node.js** course.
2. Look at this app. It has default instrumentation.
3. Run this app. 
4. Connect this app to Honeycomb.
5. See what the traces look like.
6. Improve the traces.


## Running the application

Run this locally in docker-compose, sending traces to Honeycomb. Then you can practice improving the instrumentation for better observability.

If you don't have Docker locally, you can [run this in GitPod](https://gitpod.io/#https://github.com/honeycombio/observability-day-workshop) or use Codespaces.

### One-time setup

Clone this repository.

```bash
git clone https://github.com/honeycombio/observability-day-workshop
```

Have Docker installed.

Define your Honeycomb API key. Add this to the middle of `.env`:

```bash
HONEYCOMB_API_KEY="paste your api key here"
```

If you don't have an API key handy, here is the [Documentation](https://docs.honeycomb.io/get-started/configure/environments/manage-api-keys/#create-api-key).
If you want more stepping-through of how to get an API key, there are instructions for this in [Observaquiz](https://quiz.honeydemo.io); type in a name to get to the second page.

### Run the app

`./run`

(This will run `docker compose` in daemon mode, and build containers)

Access the app:

[http://localhost:8080]()

After making changes to a service, you can tell it to rebuild just that one:

`./run [ meminator | backend-for-frontend | image-picker | phrase-picker ]`

### Try it out

Visit [http://localhost:8080]()

Click the "GO" button. Then wait.
