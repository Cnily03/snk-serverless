import { Redis } from "@upstash/redis";

export function kv(_kv: KVStorage | KVNamespace | undefined, env: Env): KVStorage {
  if (_kv && ["get", "put", "delete", "list"].every((m) => Object.hasOwn(_kv, m))) {
    // kv binding
    return _kv as KVStorage;
  }

  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;

  if (url && token) {
    // fallback to Upstash Redis
    const redis = new Redis({ url, token });
    return {
      get: async (key: string) => {
        const value = await redis.get(key);
        return value === null ? null : String(value);
      },
      put: async (key: string, value: string) => {
        await redis.set(key, value);
      },
      delete: async (key: string) => {
        await redis.del(key);
      },
      list: async (options?: { prefix?: string }) => {
        const prefix = options?.prefix ?? "";
        const keys = await redis.keys(`${prefix}*`);
        return { keys };
      },
    };
  }

  // fallback to empty
  return {
    get: async (_key: string) => null,
    put: async (_key: string, _value: string) => {},
    delete: async (_key: string) => {},
    list: async (_options?: { prefix?: string }) => ({ keys: [] }),
  };
}
