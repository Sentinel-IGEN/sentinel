#include <Arduino.h>
#include <Modem.h>
#include <TinyGsmClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <ctype.h>
#include <secrets.h>

/*********************************************
 * Constants
 **********************************************/
#define DEVICE_NAME "device1" // Unique for each bike tag

// Misc
#define S_TO_US 1000000
#define S_TO_MS 1000

// Range to attempt to autobaud
#define GSM_AUTOBAUD_MIN 9600
#define GSM_AUTOBAUD_MAX 115200

// IMU
#define MOTION_EVENT_DURATION 40

// Ping Intervals
#define MOTION_DETECTION_INTERVAL_MS 3 * S_TO_MS
#define HEALTH_INTERVAL_MS 10 * S_TO_MS

/*********************************************
 * MQTT
 *
 * Constants for MQTT configuration
 **********************************************/
const char *broker = "fb14f44e5bae4ffbb829c97b6cdc10eb.s2.eu.hivemq.cloud";

// Subscribe Topics
String topicLockRequest = String("lock/") + DEVICE_NAME;
String topicMotionStatusRequest = String("motion_threshold/") + DEVICE_NAME;
String subscribeTopics[] = {topicLockRequest, topicMotionStatusRequest};

// Publish Topics
String topicMotionStatus = String("motion_status/") + DEVICE_NAME;
String topicLockStatus = String("lock_status/") + DEVICE_NAME;
String topicDeviceHealth = String("device_health/") + DEVICE_NAME;

/*********************************************
 * MQTT/ modem variables
 **********************************************/
TinyGsm modem(SerialAT);
TinyGsmClientSecure client(modem);
PubSubClient mqtt(client);
char mqttClientID[10];
int numReconnect = 0;

/*********************************************
 * Motion detection variables
 **********************************************/
Adafruit_MPU6050 mpu;
bool motionDetected = false;
int motionDetectionThreshold = 3;

/*********************************************
 * Application variables
 **********************************************/
bool lockStatus = false;
uint32_t lastHealthPing = 0;
uint32_t lastMotionPing = 0;
DynamicJsonDocument doc(1024);

/**
 * Callback for motion detection interrupt
 */
void handleMotionDetection()
{
    motionDetected = true;
}

/**
 * Generate a unique 9 character MQTT client ID
 */
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
            return;
        mpu.setMotionInterrupt(lockStatus);
        mqtt.publish(topicLockStatus.c_str(), lockStatus ? "1" : "0");
    }

    if (String(topic) == topicMotionStatusRequest)
    {
        int newMotionDetectionThreshold = doc["command"];
        if (newMotionDetectionThreshold > 10 || newMotionDetectionThreshold < 0)
            return;

        motionDetectionThreshold = newMotionDetectionThreshold;
        mpu.setMotionDetectionThreshold(motionDetectionThreshold);
        String response = "r" + String(motionDetectionThreshold);
        mqtt.publish(topicMotionStatus.c_str(), response.c_str());
    }
}

/**
 * Connects to MQTT broker and intantiates network connection
 */
static bool mqttConnect()
{
    generateUniqueID();
    mqtt.disconnect();
    Modem::initialize(modem, numReconnect++);
    delay(1000);

    SerialMon.println("Connecting to " + String(MQTT_BROKER) + " with client ID: " + mqttClientID);
    bool mqttConnected = mqtt.connect(mqttClientID, MQTT_USER, MQTT_PASSWORD, "device_health/device1", 2, false, "0", true);

    if (mqttConnected == false)
    {
        SerialMon.println("MQTT connection failed.");
        return false;
    }

    SerialMon.println("MQTT connection success!");
    for (String topic : subscribeTopics)
    {
        mqtt.subscribe(topic.c_str(), 1);
    }
    return mqtt.connected();
}

void setup()
{
    SerialMon.begin(115200);
    SerialAT.begin(UART_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);
    pinMode(LED_PIN, OUTPUT);

    // IMU setup
    if (!mpu.begin())
    {
        Serial.println("Failed to find MPU6050 chip");
        while (1)
            delay(10);
    }

    // Setup motion detection
    mpu.setMotionInterrupt(false);
    mpu.setHighPassFilter(MPU6050_HIGHPASS_0_63_HZ);
    mpu.setMotionDetectionThreshold(motionDetectionThreshold);
    mpu.setMotionDetectionDuration(MOTION_EVENT_DURATION);
    mpu.setInterruptPinLatch(false); // Keep it latched.  Will turn off when reinitialized.
    mpu.setInterruptPinPolarity(true);

    // Disable unnecessary functions on IMU
    mpu.setGyroStandby(true, true, true);
    mpu.setTemperatureStandby(true);

    // Setup motion interrupt
    pinMode(32, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(32), handleMotionDetection, HIGH);

    // MQTT setup
    mqtt.setServer(broker, 8883);
    mqtt.setCallback(mqttCallback);
    mqtt.setKeepAlive(60);
}

void loop()
{
    // LED off when connected
    modem.isNetworkConnected() ? digitalWrite(LED_PIN, HIGH) : digitalWrite(LED_PIN, LOW);

    if (!mqtt.connected())
    {
        SerialMon.println("MQTT not connected, connecting now...");
        mqttConnect();
        SerialMon.println("State: " + String(mqtt.state()));
    }

    if (millis() - lastHealthPing > HEALTH_INTERVAL_MS)
    {
        mqtt.publish(topicDeviceHealth.c_str(), "1");
        lastHealthPing = millis();
    }

    if (lockStatus && motionDetected && ((millis() - lastMotionPing) > MOTION_DETECTION_INTERVAL_MS))
    {
        motionDetected = false;
        lastMotionPing = millis();
        SerialMon.println("Motion detected");
        mqtt.publish(topicMotionStatus.c_str(), "1");
    }

    mqtt.loop();

    esp_sleep_enable_ext0_wakeup(GPIO_NUM_32, LOW);
    esp_sleep_enable_timer_wakeup(1 * S_TO_US);
    esp_light_sleep_start();
}