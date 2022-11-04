/**************************************************************
 *
 * Important libraries used:
 * PubSubClient
 * https://github.com/knolleary/pubsubclient
 *
 * Documentation
 * https://pubsubclient.knolleary.net/api
 *
 **************************************************************
 * This test connects to HiveMQ's showcase broker.
 *
 * We can test sending and receiving messages from the HiveMQ webclient
 * available at http://www.hivemq.com/demos/websocket-client/.
 *
 * Subscribe to the topic GsmClientTest/ledStatus
 * Publish "toggle" to the topic GsmClientTest/led and the LED on your board
 * should toggle and you should see a new message published to
 * GsmClientTest/ledStatus with the newest LED status.
 *
 **************************************************************/
#include <Arduino.h>
#include <Modem.h>

// See all AT commands, if wanted
// #define DUMP_AT_COMMANDS

// Range to attempt to autobaud
// NOTE:  DO NOT AUTOBAUD in production code.  Once you've established
// communication, set a fixed baud rate using modem.setBaud(#).
#define GSM_AUTOBAUD_MIN 9600
#define GSM_AUTOBAUD_MAX 115200

// Add a reception delay, if needed.
// This may be needed for a fast processor at a slow baud rate.
// #define TINY_GSM_YIELD() { delay(2); }

// MQTT details
const char *broker = "broker.hivemq.com";
const char *topicLED = "GsmClientTest/led";
const char *topicInit = "GsmClientTest/init";
const char *topicLEDStatus = "GsmClientTest/ledStatus";

#include <TinyGsmClient.h>
#include <PubSubClient.h>

#ifdef DUMP_AT_COMMANDS
#include <StreamDebugger.h>
StreamDebugger debugger(SerialAT, SerialMon);
TinyGsm modem(debugger);
#else
TinyGsm modem(SerialAT);
#endif

TinyGsmClient client(modem);
PubSubClient mqtt(client);

#define LED_PIN 13
int ledStatus = LOW;
uint32_t lastReconnectAttempt = 0;
float lat, lon = 0;

void mqttCallback(char *topic, byte *payload, unsigned int len)
{
  SerialMon.print("Message arrived [");
  SerialMon.print(topic);
  SerialMon.print("]: ");
  SerialMon.write(payload, len);
  SerialMon.println();

  // Only proceed if incoming message's topic matches
  if (String(topic) == topicLED)
  {
    ledStatus = !ledStatus;
    digitalWrite(LED_PIN, ledStatus);
    mqtt.publish(topicLEDStatus, ledStatus ? "1" : "0");
  }
}

boolean mqttConnect()
{
  SerialMon.print("Connecting to ");
  SerialMon.print(broker);

  // Connect to MQTT Broker
  boolean status = mqtt.connect("GsmClientTest");
  if (status == false)
  {
    SerialMon.println("MQTT connection failed.");
    return false;
  }
  SerialMon.println("MQTT connection success!");

  mqtt.publish(topicInit, "MQTT test started!");
  mqtt.subscribe(topicLED);
  return mqtt.connected();
}

void setup()
{
  // Set console baud rate
  SerialMon.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  SerialAT.begin(UART_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);

  Modem::initialize(modem);

  // GPRS connection parameters are usually set after network registration
  SerialMon.print("Connecting to " + String(apn));

  // MQTT Broker setup
  mqtt.setServer(broker, 1883);
  mqtt.setCallback(mqttCallback);

  Modem::enableGPS(modem);
}

void loop()
{
  Modem::checkConnection(modem);

  if (!mqtt.connected())
  {
    // Reconnect every 10 seconds
    uint32_t t = millis();
    if (t - lastReconnectAttempt > 10000L)
    {
      SerialMon.println("MQTT not connected, connecting now...");
      lastReconnectAttempt = t;
      if (mqttConnect())
      {
        lastReconnectAttempt = 0;
      }
    }
    delay(100);
    return;
  }

  mqtt.loop();
}