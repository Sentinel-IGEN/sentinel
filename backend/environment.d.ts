declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      DB_URL: string;
    }
  }
}

// convert into module by adding an empty export statement.
export {};
