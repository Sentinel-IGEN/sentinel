import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnApplicationBootstrap {
    private client: mqtt.MqttClient | undefined;
    private readonly subscribedTopics = ['device_health/#', 'lock_status/#', 'motion_status/#', 'GPS/#'];
    private readonly publishTopics = ["alarm", "lock", "motion_threshold"];

    onApplicationBootstrap() {
        Logger.debug(`MQTT Service startup: Connecting to ${process.env.MQTT_CLUSTER_URL}`);
        const options: mqtt.IClientOptions = {
            port: 8883,
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD
        }
        this.client = mqtt.connect(process.env.MQTT_CLUSTER_URL, options);

        this.subscribedTopics.forEach((topic) => {
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

    publishMessage(topic: string, device: string, message: string) {
        if (!this.publishTopics.includes(topic)) {
            return false;
        }
        const targetTopic = topic + "/" + device;
        Logger.debug("Sending message " + message + " to topic " + topic);
        this.client?.publish(targetTopic, message, {qos: 1});
        return true;
    }
}
