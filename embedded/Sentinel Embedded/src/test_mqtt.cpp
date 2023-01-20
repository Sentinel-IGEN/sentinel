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
#include <TinyGsmClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <secrets.h>

// Range to attempt to autobaud
#define GSM_AUTOBAUD_MIN 9600
#define GSM_AUTOBAUD_MAX 115200
#define S_TO_US 1000000
#define LED_PIN 12

// MQTT details
const char *broker = "fb14f44e5bae4ffbb829c97b6cdc10eb.s2.eu.hivemq.cloud";
// Subscribed Topics
const char *topicLockRequest = "lock/device1";
// Publish Topics
const char *topicLockStatus = "lock_status/device1";
const char *topicDeviceHealth = "device_health/device1";

TinyGsm modem(SerialAT);
TinyGsmClientSecure client(modem);
PubSubClient mqtt(client);

bool lockStatus = false;
uint32_t lastMQTTPing = 0;
int numReconnect = 0;
bool modemConnected = false;
char mqttClientID[10];
DynamicJsonDocument doc(1024);

// Generate a unique 9 character MQTT client ID
static void generateUniqueID()
{
  for (int i = 0; i < 9; ++i)
    mqttClientID[i] = 'a' + rand() % 26;
}

static void mqttCallback(char *topic, byte *payload, unsigned int len)
{
  String data = String((char *)payload, len);
  SerialMon.println("Message arrived [" + String(topic) + "]: " + data);
  deserializeJson(doc, data);
  
  if (String(topic) == topicLockRequest)
  {
    if (doc["command"] == 1)
      lockStatus = true;
    else if (doc["command"] == 0)
      lockStatus = false;
    else
      SerialMon.println("Unrecognized lock command: " + data);
    mqtt.publish(topicLockStatus, lockStatus ? "Lock on": "Lock off");
  }
}

static bool mqttConnect()
{
  generateUniqueID();
  numReconnect++;
  mqtt.disconnect();

  if (numReconnect > 1)
    Modem::initialize(modem, true);

  delay(1000);

  SerialMon.println("Connecting to " + String(MQTT_BROKER) + " with client ID: " + mqttClientID);
  bool mqttConnected = mqtt.connect(mqttClientID, MQTT_USER, MQTT_PASSWORD, "device_health/device1", 2, false, "Disconnected", true);

  if (mqttConnected == false)
  {
    SerialMon.println("MQTT connection failed.");
    return false;
  }

  SerialMon.println("MQTT connection success!");
  mqtt.subscribe(topicLockRequest, 1);
  return mqtt.connected();
}

void setup()
{
  SerialMon.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  SerialAT.begin(UART_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);

  Modem::initialize(modem);

  mqtt.setServer(broker, 8883);
  mqtt.setCallback(mqttCallback);
  mqtt.setKeepAlive(60);
}

void loop()
{
  modemConnected = modem.isNetworkConnected();

  if (!modemConnected)
  {
    Modem::initialize(modem, true, false);
  }

  if (!mqtt.connected())
  {
    SerialMon.println("MQTT not connected, reconnecting now...");
    mqttConnect();
    SerialMon.println("State: " + String(mqtt.state()));
  }

  if (millis() - lastMQTTPing > 10000)
  {
    mqtt.publish(topicDeviceHealth, "Connected");
    lastMQTTPing = millis();
  }

  mqtt.loop();

  esp_sleep_enable_timer_wakeup(1 * S_TO_US);
  esp_light_sleep_start();
}