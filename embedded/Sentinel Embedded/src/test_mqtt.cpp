/**************************************************************
 *
 * Important libraries used:
 * PubSubClient
 * https://github.com/knolleary/pubsubclient
 *
 * Documentation
 * https://pubsubclient.knolleary.net/api
 *
 **************************************************************/
#include <Arduino.h>
#include <Modem.h>

// Range to attempt to autobaud
// NOTE:  DO NOT AUTOBAUD in production code.  Once you've established
// communication, set a fixed baud rate using modem.setBaud(#).
#define GSM_AUTOBAUD_MIN 9600
#define GSM_AUTOBAUD_MAX 115200

// MQTT details
const char *broker = "fb14f44e5bae4ffbb829c97b6cdc10eb.s2.eu.hivemq.cloud";
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

TinyGsmClientSecure client(modem);
PubSubClient mqtt(client);

#define LED_PIN 12
int ledStatus = HIGH;
uint32_t lastReconnectAttempt = 0;

void mqttCallback(char *topic, byte *payload, unsigned int len)
{
  SerialMon.println("Message arrived [" + String(topic) + "]: " + String((char *)payload, len));

  if (String(topic) == topicLED)
  {
    ledStatus = !ledStatus;
    digitalWrite(LED_PIN, ledStatus);
    mqtt.publish(topicLEDStatus, ledStatus ? "LED off" : "LED on");
  }
}

boolean mqttConnect()
{
  mqtt.disconnect();
  SerialMon.println("Connecting to " + String(broker));
  boolean status = mqtt.connect("GsmClientTest", "Sentinel", "sentinel");
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
  mqtt.setServer(broker, 8883);
  mqtt.setCallback(mqttCallback);
  mqtt.setKeepAlive(90);

  Modem::enableGPS(modem);
}

void loop()
{
  Modem::checkConnection(modem);

  if (!mqtt.connected())
  {
    SerialMon.println("MQTT not connected.");
    SerialMon.println(Modem::checkConnection(modem) ? "Network connection healthy." : "Network connection failure.");

    SerialMon.println("MQTT not connected, reconnecting now...");
    mqttConnect();
    SerialMon.println("State: " + String(mqtt.state()));
  }

  mqtt.loop();
}