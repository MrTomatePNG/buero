// ecosystem.config.js
export const apps = [
  {
    name: "buero-app",
    script: "./build/index.js",
    interpreter: "node",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      BODY_SIZE_LIMIT: "10M",
      ORIGIN: "https://buero.fun",
    },
  },
];
