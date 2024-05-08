
# Honeycomb Academy: Sample Meminator App

This contains a sample application for use in Honeycomb Academy lab activities. This app has 4 services.  

It generates images by combining a randomly chosen picture with a randomly chosen phrase.

## Introduction

Hello! Welcome to the **Instrumenting with Node.js** course lab.

1. Take a look at this app. The `backend-to-frontend` service needs to be instrumented.
2. Before you can do that, you need to run this app. 
3. Then, connect this app to Honeycomb.
4. See what the traces look like.
5. Improve the traces.


## Running the application

There are 2 ways you can run this app: 

1. Locally in Docker Compose, which requires a one-time setup
2. In Gitpod
3. Use Codespaces

Once you run the application, you can send traces to Honeycomb. Then you can practice improving the instrumentation for better observability. 


### One-time setup

Clone this repository.

```bash
git clone https://github.com/honeycombio/academy-instrumentation-nodejs
```

Have Docker installed.

Define your Honeycomb API key. Add this to the middle of `.env`:

```bash
HONEYCOMB_API_KEY="paste your api key here"
```

If you don't have an API key handy, here is the [documentation](https://docs.honeycomb.io/get-started/configure/environments/manage-api-keys/#create-api-key).

If you want more stepping-through of how to get an API key, there are instructions for this in [Observaquiz](https://quiz.honeydemo.io); type in a name to get to the second page.

### GitPod setup

Go to [Gitpod](https://honeycombio-academyinst-i0cuptb35ss.ws-us110.gitpod.io/) to open the repository.

Confirm the workspace creation. You can work in the browser with VS Code Browser or in your local code editor.

### Codespaces setup

Open the repository on GitHub. Open the `<> Code` dropdown down menu. 

Select the `Codespaces` tab. Create a codespace on main. 

### Run the app

`./run`

(This will run `docker compose` in daemon mode, and build containers.)

Access the app:

[http://localhost:8080]()

After making changes to a service, you can tell it to rebuild just that one:

`./run [ meminator | backend-for-frontend | image-picker | phrase-picker ]`

### Try it out

Visit [http://localhost:8080]()

Click the "GO" button. Then wait.