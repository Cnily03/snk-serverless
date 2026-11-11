# Snake for Serverless

A serverless deployment of [Platane/snk](https://github.com/Platane/snk).

> Generates a snake game from a github user contributions graph and output a screen capture as animated svg.

## Features

Request `/snk/:username` to get the snake game SVG for the github user `:username`.

Supported query parameters:

| Parameter | Description                                                   | Default |
| --------- | ------------------------------------------------------------- | ------- |
| `theme`   | The theme of the snake game. Can be either `light` or `dark`. | `light` |

Examples:

- `/snk/Cnily03`
- `/snk/Cnily03?theme=dark`

The serverless application would regenerate the SVG according to scheduled tasks you set in configurations.

## Install and Deploy

Clone the repository with submodules:

```bash
git clone --recurse-submodules https://github.com/Cnily03/snk-serverless.git
```

Run the following command to install dependencies:

```bash
pnpm install
```

Please refer to [Configuration](#configuration) section before deployment.

### Deploy to Cloudflare Workers

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Cnily03/snk-serverless)

> [!WARNING]
> You may meet CPU Time Limit Exceeded errors on Cloudflare Workers. Only Pro accounts or above can run this project via Cloudflare Workers.

Copy [wrangler.toml](./wrangler.toml) to `wrangler.local.toml` and modify the configuration to match your environment.

Create a KV namespace in your Cloudflare account and add the binding to `wrangler.local.toml`:

```bash
wrangler kv namespace create KV_NAMESPACE # KV_NAMESPACE is the name of the namespace
```

Replace `[[kv_namespaces]].id` in `wrangler.local.toml` with the returned ID of the created namespace.

Set the environment variables for the Cloudflare Workers project:

| Variable | Description |
| -------- | ----------- |
| `GITHUB_TOKEN` | GitHub PAT. See [Github Token](#github-token). **Please set it as a secret.** |
| `WHITELIST` | Comma-separated allowed usernames. Leave empty to allow all users. |
| `CACHE_NAME` | *(optional)* The name of the Cloudflare cache to use. See [Cache - Cloudflare API](https://developers.cloudflare.com/api/resources/cache/). |
| `CACHE_SECONDS` | *(optional)* The number of seconds to cache the response. |

To start a development server, run:

```bash
pnpm dev:cf
```

To deploy to Cloudflare workers, run:

```bash
pnpm deploy:cf
```

### Deploy to Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCnily03%2Fsnk-serverless&env=GITHUB_TOKEN,CRON_SECRET&project-name=snk-serverless&repository-name=snk-serverless)

Create an Upstash Redis database on [upstash.com](https://console.upstash.com) (or install the [Upstash integration](https://vercel.com/marketplace/upstash) from the [Vercel Marketplace](https://vercel.com/marketplace)) and copy its REST credentials.

Set the environment variables for the Vercel project:

| Variable | Description |
| -------- | ----------- |
| `GITHUB_TOKEN` | GitHub PAT. See [Github Token](#github-token). **Please set it as a secret.** |
| `WHITELIST` | Comma-separated allowed usernames. Leave empty to allow all users. |
| `UPSTASH_REDIS_REST_URL` or `KV_REST_API_URL` | Upstash Redis REST URL. |
| `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_TOKEN` | Upstash Redis REST token. |
| `CRON_SECRET` | Required by scheduled tasks. |

To deploy to Vercel, run:

```bash
pnpm run deploy:vercel
```

## Github Token

Get your Personal Access Token (PAT)

### Classic token

- Go to [Account -> Settings -> Developer Settings -> Personal access tokens -> Tokens (classic)](https://github.com/settings/tokens).
- Click on `Generate new token -> Generate new token (classic)`.
- Scopes to select:
  - `read:user`
- Click on `Generate token` and copy it.

If you want to show your private contributions

- Go to [Account -> Settings -> Public Profile](https://github.com/settings/profile).
- Find `Contributions & activity` section
- Check `Include private contributions on my profile`.
- Click on `Update preferences`.

### Fine-grained token

- Go to [Account -> Settings -> Developer Settings -> Personal access tokens -> Fine-grained tokens](https://github.com/settings/tokens).
- Click on `Generate new token -> Generate new token`.
- Select an expiration date.
- Select All repositories.
- No any permission is needed.
- Click on `Generate token` and copy it.

## License

CopyRight (c) Cnily03. All rights reserved.

Licensed under the [MIT](./LICENSE) License.
