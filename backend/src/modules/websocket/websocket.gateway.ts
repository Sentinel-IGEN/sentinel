import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer as WBServer,
} from '@nestjs/websockets';
import WebSocket, { Server } from 'ws';

interface WebSocketRecieveMessage {
  command: string;
  device?: string;
}

interface WebSocketReplyMessage {
  topic: string;
  payload: string;
}

@Injectable()
@WebSocketGateway()
export class WebSocketListener implements OnGatewayInit {
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

  sendMessage(device: string, topic: string, payload: string) {
    if (this.connections.has(device)) {
      const data: WebSocketReplyMessage = { topic: topic, payload: payload };
      this.connections.get(device)?.send(JSON.stringify(data));
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
