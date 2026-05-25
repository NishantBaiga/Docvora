import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { config } from "./config";

const redis = new Redis({
  url: config.upstash.url,
  token: config.upstash.token,
});

// 10 messages per minute per user for chat
export const chatRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:chat",
});

// 5 inits per hour per user for workspace init
export const initRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ratelimit:init",
});