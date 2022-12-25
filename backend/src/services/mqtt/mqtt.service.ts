import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnApplicationBootstrap {
    private client: mqtt.MqttClient | undefined;
    private readonly subscribed_topics = ['device_health/#', 'lock_status/#', 'alarm/#', 'lock/#'];

    onApplicationBootstrap() {
        Logger.debug(`MQTT Service startup: Connecting to ${process.env.MQTT_CLUSTER_URL}`);
        const options: mqtt.IClientOptions = {
            port: 8883,
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD
        }
        this.client = mqtt.connect(process.env.MQTT_CLUSTER_URL, options);

        this.subscribed_topics.forEach((topic) => {
            this.client?.subscribe(topic, (err) => {
                if (err) {
                    Logger.error(`[Topic: ${topic}] ${err}`);
                }
                else {
                    Logger.debug(`[Topic: ${topic}] Client subscription success`);
                }
            });
        });

        this.client.on('message', (topic, payload) => {
            Logger.debug(`[Topic: ${topic}] Recieved message: ${payload}`);
        })
    }
}
