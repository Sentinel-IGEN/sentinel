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
#include <WiFi.h>
#include <WiFiClientSecure.h>

/*********************************************
 * Constants
 **********************************************/
#define DEVICE_NAME "demo01" // Unique for each bike tag

// Device options
#define USE_DEBUG
#define USE_WIFI
#define USE_IMU
#define USE_WIFI_LOCATION

// Misc
#define S_TO_US 1000000
#define S_TO_MS 1000

// Range to attempt to autobaud
#define GSM_AUTOBAUD_MIN 9600
#define GSM_AUTOBAUD_MAX 115200

// IMU
#define MOTION_EVENT_DURATION 40

// Ping Intervals
#define MOTION_DETECTION_INTERVAL_MS 5 * S_TO_MS
#define HEALTH_INTERVAL_MS 10 * S_TO_MS

// Alarm
#define ALARM_PIN 33
#define ALARM_RESET_INTERVAL_MS 6 * S_TO_MS

// GPS
#define GPS_UPDATE_INTERVAL_MS 30 * S_TO_MS

// Debug macro
#ifdef USE_DEBUG
#define DEBUG(s) SerialMon.println(s);
#else
#define DEBUG(S) (...);
#endif

/*********************************************
 * MQTT/ modem/ WiFi variables
 **********************************************/
// Subscribe Topics
String topicLockRequest = String("lock/") + DEVICE_NAME;
String topicMotionThresholdRequest = String("motion_threshold/") + DEVICE_NAME;
String topicAlarmRequest = String("alarm/") + DEVICE_NAME;
String subscribeTopics[] = {topicLockRequest, topicMotionThresholdRequest, topicAlarmRequest};

// Publish Topics
String topicMotionStatus = String("motion_status/") + DEVICE_NAME;
String topicMotionThresholdStatus = String("motion_threshold_status/") + DEVICE_NAME;
String topicLockStatus = String("lock_status/") + DEVICE_NAME;
String topicDeviceHealth = String("device_health/") + DEVICE_NAME;
String topicGPS = String("gps/") + DEVICE_NAME;
String topicWifiGPS = String("wifi_gps/") + DEVICE_NAME;

// LTE Modem and wifi
TinyGsm modem(SerialAT);
#ifdef USE_WIFI
WiFiClientSecure client;
#else
TinyGsmClientSecure client(modem);
#endif
PubSubClient mqtt(client);
char mqttClientID[15];
int numReconnect = 0;

/*********************************************
 * Motion detection variables
 **********************************************/
Adafruit_MPU6050 mpu;
volatile bool motionDetected = false;
int motionDetectionThreshold = 3;

/*********************************************
 * Application variables
 **********************************************/
unsigned long currentTime; // store current time on each loop
bool lockStatus = false;
uint32_t lastHealthPing = 0;
uint32_t lastMotionPing = 0;
uint32_t lastGPSPing = 0;
float lat, lon;
DynamicJsonDocument doc(1024);
bool wifiScanComplete = false;
String wifiLocation = "";

/*********************************************
 * Alarm timing
 **********************************************/
uint32_t lastAlarmTrigger = 0;
volatile bool alarmStatus = false;
bool alarmToggle = false;
unsigned long alarmToggleTimeMS = 0;
unsigned const long alarmSleepTimeMS = 80;

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
    randomSeed(millis());
    for (int i = 0; i < 14; ++i)
        mqttClientID[i] = 'a' + random(300) % 26;
}

static void mqttCallback(char *topic, byte *payload, unsigned int len)
{
    String data = String((char *)payload, len);
    DEBUG("Message arrived [" + String(topic) + "]: " + data)
    deserializeJson(doc, data);
    String topicString = String(topic);

    if (topicString == topicLockRequest)
    {
        bool command = doc["command"];
        if (command)
            lockStatus = true;
        else
        {
            lockStatus = false;
            alarmStatus = false;
        }
        mpu.setMotionInterrupt(lockStatus);
        mqtt.publish(topicLockStatus.c_str(), lockStatus ? "1" : "0");
    }
    else if (topicString == topicMotionThresholdRequest)
    {
        int newMotionDetectionThreshold = doc["command"];
        if (newMotionDetectionThreshold > 10 || newMotionDetectionThreshold < 0)
            return;

        motionDetectionThreshold = newMotionDetectionThreshold;
        mpu.setMotionDetectionThreshold(motionDetectionThreshold);
        String response = String(motionDetectionThreshold);
        mqtt.publish(topicMotionThresholdStatus.c_str(), response.c_str());
    }
    else if (topicString == topicAlarmRequest)
    {
        bool command = doc["command"];
        if (command)
        {
            lastAlarmTrigger = millis();
            alarmStatus = true;
            return;
        }
        alarmStatus = false;
    }
}

/**
 * Connects to MQTT broker and intantiates network connection
 */
bool mqttConnect()
{
    generateUniqueID();
    mqtt.disconnect();
#ifdef USE_WIFI
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
#else
    Modem::initialize(modem, true);
#endif

    delay(2000);

    DEBUG("Connecting to " + String(MQTT_BROKER) + " with client ID: " + mqttClientID + " and user " + MQTT_USER)
    bool mqttConnected = mqtt.connect(mqttClientID, MQTT_USER, MQTT_PASSWORD, "device_health/device1", 2, false, "0", true);

    if (mqttConnected == false)
    {
        DEBUG("MQTT connection failed.")
        return false;
    }

    DEBUG("MQTT connection success!")
    for (String &topic : subscribeTopics)
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

#ifdef USE_WIFI
    // Set up wifi certificate
    client.setCACert(cert);
    client.setInsecure();
#endif

    // Setup alarm settings
    pinMode(ALARM_PIN, OUTPUT);

#ifdef USE_IMU
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
    mpu.setInterruptPinPolarity(false);

    // Disable unnecessary functions on IMU
    mpu.setGyroStandby(true, true, true);
    mpu.setTemperatureStandby(true);

    // Setup motion interrupt
    pinMode(32, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(32), handleMotionDetection, HIGH);

    // MQTT setup
    mqtt.setServer(MQTT_BROKER, 8883);
    mqtt.setCallback(mqttCallback);
    mqtt.setKeepAlive(30);
#endif

    // GPS Setup
    // Modem::enableGPS(modem);
}

void loop()
{
    // LED off when connected
    digitalWrite(LED_PIN, HIGH);

    if (!mqtt.connected())
    {
        digitalWrite(LED_PIN, LOW);
        DEBUG("MQTT not connected, connecting now...")
        mqttConnect();
        DEBUG("State: " + String(mqtt.state()))
    }

    currentTime = millis();

    if (currentTime - lastHealthPing > HEALTH_INTERVAL_MS)
    {
        mqtt.publish(topicDeviceHealth.c_str(), "1");
        lastHealthPing = currentTime;
    }

#ifdef USE_WIFI_LOCATION
    if (currentTime - lastGPSPing > GPS_UPDATE_INTERVAL_MS)
    {
        wifiScanComplete = Modem::getSurroundingWiFiJsonAsync(wifiLocation);
        if (wifiScanComplete) {
            mqtt.publish(topicWifiGPS.c_str(), wifiLocation.c_str());
            lastGPSPing = currentTime;
        }
    }
#endif

    if (lockStatus && motionDetected && ((currentTime - lastMotionPing) > MOTION_DETECTION_INTERVAL_MS))
    {
        motionDetected = false;
        lastMotionPing = currentTime;

        alarmStatus = true;
        lastAlarmTrigger = currentTime;

        mqtt.publish(topicMotionStatus.c_str(), "1");
    }
    else
    {
        motionDetected = false;
    }

    // Alarm
    if (currentTime - lastAlarmTrigger > ALARM_RESET_INTERVAL_MS)
        alarmStatus = false;

    if (alarmStatus)
    {
        if (currentTime > alarmToggleTimeMS)
        {
            alarmToggle = !alarmToggle;
            digitalWrite(ALARM_PIN, alarmToggle);
            alarmToggleTimeMS += alarmSleepTimeMS;
        }
    }
    else
    {
        digitalWrite(ALARM_PIN, LOW);
    }

    mqtt.loop();

#ifndef USE_WIFI
    esp_sleep_enable_ext0_wakeup(GPIO_NUM_32, LOW);
    esp_sleep_enable_timer_wakeup(0.05 * S_TO_US);
    esp_light_sleep_start();
#endif
}