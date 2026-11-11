export type Theme = "light" | "dark";

interface Variables {
  whitelist: Set<string>;
  cacheName?: string;
  cacheSeconds?: number;
}

export type EnvHono = {
  Bindings: Env;
  Variables: Variables;
};
