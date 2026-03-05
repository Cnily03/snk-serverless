export type Theme = "light" | "dark";

interface Variables {
  whitelist: Set<string>;
  cacheSeconds: number;
  cacheName: string;
}

export type EnvHono = {
  Bindings: Env;
  Variables: Variables;
};
