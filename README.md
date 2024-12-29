
# PRISM AI Agent

> An opinionanted, batteries-included, ElizaOS distribution designed for ease of development and secure, scalable deployments.

## Why?
* ElizaOS as an ecosystem is difficult to navigate and we wanted a stable(ish) environment we could deploy reliably for custoemrs.
* We wanted to be able to not only deploy agents at scale within Trustless Engineering Co., but we also wanted our customers to be able to run their agents on-prem.

## Prerequisites

Depending on the features you choose to enable, there are many extra services that must be enabled.
This will obviously increase the requirements, so plan accordingly.

**NOTE**: The default/recommended setup currently runs best with at least 8GB RAM available.

### Github Codespaces
This is the easiest way to get started!

In order to have the best experience, chose a 64GB RAM codespace.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/prism-sh/prism-agent)

### Local Installation

This repo will work on Linux/MacOS/Windows as long as you have Docker (or Docker Desktop) installed.

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  * Make sure to enable [Kubernetes](https://docs.docker.com/desktop/features/kubernetes/) in Docker Desktop.
* [Tilt](https://docs.tilt.dev/install.html) - Local Kubernetes Development Toolkit
* [Helm](https://helm.sh/docs/intro/install/) - Kubernetes Package Manager

After you have installed the required tools (or started your codespace), you are ready to start your agent!

## Quickstart

1. **Initialize**

  Setup KIND and the Registry with the init command:

  ```bash
  make init
  ```

1. **Configuration** 

  The absolute bare minimum you need to provide is an `OPENAI_API_KEY` variable.
  You can acquire one [here](https://platform.openai.com/docs/overview).


  We also suggest getting an `OPENROUTER_API_KEY` as well.
  We recommend OpenRouter because of their ability to dynamically route requests to the best model, as well as deal automatically with failovers.

  You can acquire one via [OpenRouter.ai](https://openrouter.ai/).

  Once you have the keys, add them to the newly created `.env` file:

  ```
  OPENAI_API_KEY=sk-...
  OPENROUTER_API_KEY=sk-or-....
  ```

  Any other config variables you wish to add can also be added here and will automatically be injected into the Agent runtime.

2. **Start Tilt**

  Run `tilt up` in the root directory and then visit https://localhost:10350/

NOTE: There is currently an issue where upon first startup the `@elizaos/adapter-postgres` attempts to create the `vector` plugin when it's already available.

Simply restart the `prism-agent` resource by clicking the refresh icon on the right side of it's name.

3. **Talk to your Agent**

  After a short period, you should see all green on the containers and you should be able to access the Agent UI at http://localhost:3800.


## Support

Reach out in [Discord](https://trustless.community) for help!

Made with ❤️ by [@wedtm](https://x.com/wedtm) and the [Trustless Engineering Co.](https://trustless.engineering/) team.
