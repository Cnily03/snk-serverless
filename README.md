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
| `GITHUB_TOKEN` | GitHub PAT. See [Configuration](#configuration). **Please set it as a secret.** |
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

Create an Upstash Redis database on [upstassh.com](https://console.upstash.com) (or install the [Upstash integration](https://vercel.com/marketplace/upstash) from the [Vercel Marketplace](https://vercel.com/marketplace)) and copy its REST credentials.

Set the environment variables for the Vercel project:

| Variable | Description |
| -------- | ----------- |
| `GITHUB_TOKEN` | GitHub PAT. See [Configuration](#configuration). **Please set it as a secret.** |
| `WHITELIST` | Comma-separated allowed usernames. Leave empty to allow all users. |
| `UPSTASH_REDIS_REST_URL` or `KV_REST_API_URL` | Upstash Redis REST URL. |
| `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_TOKEN` | Upstash Redis REST token. |
| `CRON_SECRET` | Required by scheduled tasks. |

> [!WARNING]
> Vercel's Git integration does not check out git submodules, but the `@snk/*` packages live in the `snk` submodule. Please deploy with the Vercel CLI manually from a machine where the submodules are checked out.

To deploy to Vercel, run:

```bash
pnpm run deploy:vercel
```

## Configuration

Get the your Personal Access Token (PAT)

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

Create file `.env` at the root of the project and add the following content:

```env
GITHUB_TOKEN="github_pat_xxx"
```

For more information about secrets, please refer to [Secrets - Cloudflare Workers docs](https://developers.cloudflare.com/workers/configuration/secrets/).

> [!NOTE]
> DO NOT forget to add GITHUB_TOKEN secret to your deployment.

Move [wrangler.sample.toml](./wrangler.sample.toml) to `wrangler.toml` and modify environment variables to match your configuration.

All available environment variables are listed in [worker-configuration.d.ts](./worker-configuration.d.ts).

## License

CopyRight (c) Cnily03. All rights reserved.

Licensed under the [MIT](./LICENSE) License.
