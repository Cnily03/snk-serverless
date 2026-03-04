# Snake for Serverless

A serverless deployment of [Platane/snk](https://github.com/Platane/snk).

> Generates a snake game from a github user contributions graph and output a screen capture as animated svg.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Cnily03/snk-serverless)

## Getting Started

### Features

Request `/:username` to get the snake game SVG for the github user `:username`.

Supported query parameters:

| Parameter | Description                                                   | Default |
| --------- | ------------------------------------------------------------- | ------- |
| `theme`   | The theme of the snake game. Can be either `light` or `dark`. | `light` |

Examples:

- `/Cnily03`
- `/Cnily03?theme=dark`

### Installation

Run the following command to install dependencies:

```bash
pnpm install
```

Other package managers can be used as well.

To start a development server, run:

```bash
pnpm dev
```

Or to deploy to Cloudflare Workers, run:

```bash
pnpm run deploy
```

Please refer to [Configuration](#configuration) section before deployment.

### Configuration

Get the your Personal Access Token (PAT)

#### Classic token

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

#### Fine-grained token

- Go to [Account -> Settings -> Developer Settings -> Personal access tokens -> Fine-grained tokens](https://github.com/settings/tokens).
- Click on `Generate new token -> Generate new token`.
- Select an expiration date.
- Select All repositories.
- No any permission is needed.
- Click on `Generate token` and copy it.

Create file `.dev.vars` at the root of the project and add the following content:

```env
GITHUB_TOKEN="github_pat_xxx"
```

For more information about secrets, please refer to [Secrets - Cloudflare Workers docs](https://developers.cloudflare.com/workers/configuration/secrets/).

> [!NOTE]
> DO NOT forget to add secret to your deployment.

Move [wrangler.sample.toml](./wrangler.sample.toml) to `wrangler.toml` and modify environment variables to match your configuration.

All available environment variables are listed in [worker-configuration.d.ts](./worker-configuration.d.ts).

## License

CopyRight (c) Cnily03. All rights reserved.

Licensed under the [MIT](./LICENSE) License.
