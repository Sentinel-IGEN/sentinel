import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer as WBServer,
} from '@nestjs/websockets';
import { FetchService } from 'nestjs-fetch';
import WebSocket, { Server } from 'ws';
import { MongoService, SNSService } from '../../services';

interface WebSocketRecieveMessage {
  command: string;
  device?: string;
}

interface WebSocketReplyMessage {
  topic: string;
  payload: string;
}

interface WebSocketReplyGPSMessage {
  topic: string;
  payload: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface GeocodeResponse {
  display_name: string;
  address: {
    building: string;
    house_number: string;
    road: string;
    postcode: string;
  };
}

@Injectable()
@WebSocketGateway()
export class WebSocketListener implements OnGatewayInit {
  constructor(
    private readonly MongoService: MongoService,
    private readonly fetch: FetchService,
    private readonly SNSService: SNSService,
  ) {}

  @WBServer()
  server: Server;
  connections: Map<string, WebSocket.WebSocket> = new Map(); // Connected ws clients
  sendMQTTMessage: CallableFunction;

  afterInit() {
    this.server.on('connection', (ws) => {
      let deviceName; // bike tag device name to register

      ws.on('error', (err) => {
        Logger.error(err);
      });

      ws.on('message', (rawData) => {
        const data = rawData.toString();
        Logger.log('Received:' + data);

        try {
          const dataDict: WebSocketRecieveMessage = JSON.parse(data);

          // Register device-phone ws mapping
          if (dataDict.command == 'register') {
            deviceName = dataDict.device;
            if (deviceName) {
              this.connections.set(deviceName, ws);
              Logger.log('Dictionary: Added ' + deviceName);
            } else {
              Logger.error('Device name is undefined.');
            }
          }
        } catch (e) {
          Logger.error(e);
          return;
        }
      });

      ws.on('close', () => {
        // Remove ws from connected ws map
        if (deviceName && this.connections.has(deviceName)) {
          this.connections.delete(deviceName);
          Logger.log('Dictionary: Deleted ' + deviceName);
        }
      });
    });
  }

  async sendMessage(device: string, topic: string, payload: string) {
    // Handle GPS caching
    if (topic === 'gps') {
      const location = payload.split(',');
      const [latitude, longitude] = [
        Number(Number(location[0]).toFixed(4)),
        Number(Number(location[1]).toFixed(4)),
      ];

      if (!(latitude && longitude)) {
        Logger.error('latitude and longitude not provided');
        return;
      }

      const res = await this.fetch.get(
        `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`,
      );

      const geoData: GeocodeResponse = await res.json();
      const address = `${geoData.address.house_number || ''} ${
        geoData.address.road || ''
      }, ${geoData.address.postcode || ''}`.trim();

      this.MongoService.appendGPSLog(device, latitude, longitude, address);

      // propogate gps message to mobile if device connected
      if (this.connections.has(device)) {
        const data: WebSocketReplyGPSMessage = {
          topic: topic,
          payload: {
            latitude,
            longitude,
            address,
          },
        };
        this.connections.get(device)?.send(JSON.stringify(data));
      }
    } else {
      // else, propogate message to mobile if device connected
      if (this.connections.has(device)) {
        const data: WebSocketReplyMessage = { topic: topic, payload: payload };
        this.connections.get(device)?.send(JSON.stringify(data));
      }

      // If motion detected, send sms instead
      if (topic == 'motion_status' && payload == '1') {
        //get embedded device
        const embeddedDevice = await this.MongoService.getEmbeddedDevice(
          device,
        );
        if (!embeddedDevice?.userId) {
          Logger.error(
            'Cannot find embeddedDevice from device id in MQTT message from embedded device',
          );
          return;
        }

        const user = await this.MongoService.getUser(embeddedDevice.userId);
        // Send SMS
        if (!user?.phoneNumber) {
          Logger.error('User does not have phone number registered.');
          return;
        }
        this.SNSService.sendSMS(
          'Sentinel Alert: Motion detected on your bike.',
          user.phoneNumber,
        );
      }
    }
  }

  /**
   * Called by MQTT service to allow websocket messages to be propagated
   * to MQTT
   */
  registerMQTTCallback(callback) {
    this.sendMQTTMessage = callback;
  }
}
