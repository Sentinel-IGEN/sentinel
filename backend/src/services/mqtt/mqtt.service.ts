import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { WebSocketListener } from 'src/modules/websocket/websocket.gateway';

@Injectable()
export class MqttService implements OnApplicationBootstrap {
  client: mqtt.MqttClient | undefined;
  subscribedTopics = [
    'device_health/#',
    'lock_status/#',
    'motion_status/#',
    'GPS/#',
  ];
  publishTopics = ['alarm', 'lock', 'motion_threshold'];
  private readonly webSocketListener: WebSocketListener;

  constructor(webSocketListener: WebSocketListener) {
    this.webSocketListener = webSocketListener;
    this.webSocketListener.registerMQTTCallback(this.publishMessage.bind(this));
  }

  onApplicationBootstrap() {
    Logger.debug(
      `MQTT Service startup: Connecting to ${process.env.MQTT_CLUSTER_URL}`,
    );
    const options: mqtt.IClientOptions = {
      port: 8883,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    };
    this.client = mqtt.connect(process.env.MQTT_CLUSTER_URL, options);

    this.subscribedTopics.forEach((topic) => {
      this.client?.subscribe(topic, (err) => {
        if (err) {
          Logger.error(`[Topic: ${topic}] ${err}`);
        } else {
          Logger.debug(`[Topic: ${topic}] Client subscription success`);
        }
      });
    });

    this.client.on('message', (topic, payload) => {
      const [parsedTopic, deviceName] = topic.split('/');
      this.webSocketListener.sendMessage(
        deviceName,
        parsedTopic,
        payload.toString(),
      );
      Logger.log(`[Topic: ${topic}] Recieved message: ${payload}`);
    });
  }

  publishMessage(topic: string, device: string, message: string) {
    Logger.log('Publish MQTT message');
    if (!this.publishTopics.includes(topic)) {
      Logger.error('Failed to publish topic, topic is not accepted');
      return false;
    }
    const targetTopic = topic + '/' + device;
    Logger.debug('Sending message ' + message + ' to topic ' + topic);
    this.client?.publish(targetTopic, message, { qos: 1 });
    return true;
  }
}
