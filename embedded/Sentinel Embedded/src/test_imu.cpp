#include <Arduino.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

Adafruit_MPU6050 mpu;
bool motionDetected = false;

void handleMotionDetection()
{
  motionDetected = true;
}

void setup(void)
{
  Serial.begin(115200);
  if (!mpu.begin())
  {
    Serial.println("Failed to find MPU6050 chip");
    while (1)
    {
      delay(10);
    }
  }

  // Setup motion detection
  mpu.setHighPassFilter(MPU6050_HIGHPASS_0_63_HZ);
  mpu.setMotionDetectionThreshold(1);
  mpu.setMotionDetectionDuration(20);
  mpu.setInterruptPinLatch(true); // Keep it latched.  Will turn off when reinitialized.
  mpu.setInterruptPinPolarity(true);
  mpu.setMotionInterrupt(true);

  // Disable unnecessary functions on IMU
  mpu.setGyroStandby(true, true, true);
  mpu.setTemperatureStandby(true);

  pinMode(32, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(32), handleMotionDetection, HIGH);
}

void loop()
{
  if (mpu.getMotionInterruptStatus())
  {
    /* Get new sensor events with the readings */
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    /* Print out the values */
    Serial.print("AccelX:");
    Serial.print(a.acceleration.x);
    Serial.print(",");
    Serial.print("AccelY:");
    Serial.print(a.acceleration.y);
    Serial.print(",");
    Serial.print("AccelZ:");
    Serial.print(a.acceleration.z);
  }
  
  Serial.println(motionDetected ? "Motion detected" : "Motion not detected");
  if (motionDetected)
    motionDetected = false;

  delay(10);
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_32, LOW);
  esp_sleep_enable_timer_wakeup(5000000);
  esp_light_sleep_start();
}