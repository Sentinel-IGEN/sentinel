declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_SNS_ANDROID_PUSH_ARN: string;
      AWS_SNS_IOS_PUSH_ARN: string;
      DB_URL: string;
      MQTT_USERNAME: string;
      MQTT_PASSWORD: string;
      MQTT_CLUSTER_URL: string;
    }
  }
}

// convert into module by adding an empty export statement.
export {};
