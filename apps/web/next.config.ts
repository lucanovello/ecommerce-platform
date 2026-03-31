import type { NextConfig } from "next";
import { getWebEnv } from "./src/env";

getWebEnv();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
