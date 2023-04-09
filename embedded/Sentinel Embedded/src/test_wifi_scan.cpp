#include <secrets.h>
#include <Arduino.h>
#include <Modem.h>

String location = "";

void setup()
{
  Serial.begin(115200);
  while (!Serial)
  {
    delay(100);
  }
}

void loop()
{
  while (1)
  {
    if (Modem::getSurroundingWiFiJsonAsync(location))
    {
      Serial.println(location);
      location = "";
      delay(10000);
    }
    Serial.println("running...");
    delay(500);
  }
}