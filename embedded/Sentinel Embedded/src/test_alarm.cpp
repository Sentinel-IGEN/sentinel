#include <Arduino.h>

#define ALARM_PIN 33

void setup(void)
{
  Serial.begin(115200);
  pinMode(ALARM_PIN, OUTPUT);
}

void loop()
{
    digitalWrite(ALARM_PIN, HIGH);
    delay(1000);
}