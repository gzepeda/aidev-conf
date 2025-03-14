# OpenAI Realtime Workshop

This is an example application showing how to use the [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) with [WebRTC](https://platform.openai.com/docs/guides/realtime-webrtc).

## Installation and usage

Before you begin, you'll need an OpenAI API key - [create one in the dashboard here](https://platform.openai.com/settings/api-keys). Create a `.env` file from the example file and set your API key in there:

```bash
cp .env.example .env
```

Running this application locally requires [Node.js](https://nodejs.org/) to be installed. Install dependencies for the application with:

```bash
npm install
```

Start the application server with:

```bash
npm run dev
```

This should start the console application on [http://localhost:3000](http://localhost:3000).

This application is a minimal template that uses [express](https://expressjs.com/) to serve the React frontend contained in the [`/client`](./client) folder. The server is configured to use [vite](https://vitejs.dev/) to build the React frontend. It uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Using this application

The `step_1_start` branch of this application contains a starting point with a minimal working example of the Realtime API, based on the [Realtime console application](https://github.com/openai/openai-realtime-console). You will be building the application for the meta use case of teaching yourself how to build with the Realtime API!

You will be asked to complete a series of four tutorial exercises in this repository that introduce important concepts of working with the Realtime API. Each tutorial's beginning and end states are checked into git branches. You can move to any point along the way by using `git checkout step_2_start` etc.

The final iteration of this application can be found on the `final` branch with `git checkout final`.

### Step 1: Prompting and configuration

The base application contains a very basic voice prompt for the application, but we can do better. The initial session configuration happens when an ephemeral token is fetched from the server. Update this configuration with a more detailed voice prompt (see the example below under `Example voice prompt`), and try a different voice from the [supported list](https://platform.openai.com/docs/api-reference/realtime-sessions/create).

- **Objective:** Initialize a Realtime session with a more expressive voice prompt, and another voice other than the default one currently used. Have the model start the conversation by speaking a greeting aloud.
- **Starting branch:** `git checkout step_1_start`
- **Solution branch:** `git checkout step_1_solution`
- [What changed](https://github.com/kwhinnery-openai/aidev-conf/compare/step_1_start...step_1_solution)?

**Useful resources:**

- TODO: list out code files and other links to help folks complete this step of the tutorial

### Step 2: Function calling

One of the most important techniques to master when building LLM apps (with Realtime or no) is extending the capabilities of the model with [function calling](https://platform.openai.com/docs/guides/realtime-model-capabilities#function-calling). At this phase, you can attempt building and configuring a function that will be called when the user asks a question about building with the Realtime API.

- **Objective:** Configure a function that will be called whenever the user asks a question about a code sample for the Realtime API. Display their query in a seaparate part of the UI.
- **Starting branch:** `git checkout step_2_start`
- **Solution branch:** `git checkout step_2_solution`

**Useful resources:**

- TODO: list out code files and other links to help folks complete this step of the tutorial

### Step 3: Server-side tools

To complete many tool call requests, you will need to work alongside a server to access other data and APIs. In this case, you will use the brand new [Responses API](https://platform.openai.com/docs/api-reference/responses) to generate a text completion from a GPT-4o model, using context from files uploaded to a [vector store](https://platform.openai.com/docs/guides/tools-file-search) in the OpenAI platform.

To set up your application to do this, run `node ./create_vector_store.js`. This will create a vector store containing uploaded PDF documents with information about the OpenAI Realtime API. It will enable the model to answer questions about the API using the most up to date information.

- **Objective:** Extend the tool call you created in Step 2 to make a call to the server, which will use the Responses API to find up to date information about code questions related to Realtime.
- **Starting branch:** `git checkout step_3_start`
- **Solution branch:** `git checkout step_3_solution`

**Useful resources:**

- TODO: list out code files and other links to help folks complete this step of the tutorial

### Step 4: Guardrails

When dealing with model responses, you will often need to implement **guardrails** to ensure that what the model is saying is accurate and in keeping with your intended tone and behavior. At this step, we will listen for audio transcription events, and cut off the model if it starts to talk about subjects that we don't want it to talk about.

- **Objective:** On the client, listen for realtime audio transcription events, and moderate the content generated from the model. If the model starts to talk about the PHP programming language (or another one you choose!), cut off the model's response.
- **Starting branch:** `git checkout step_4_start`
- **Solution branch:** `git checkout final`

**Useful resources:**

- TODO: list out code files and other links to help folks complete this step of the tutorial

## License

MIT
