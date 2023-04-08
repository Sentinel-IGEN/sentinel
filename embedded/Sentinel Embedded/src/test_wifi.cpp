#include <PubSubClient.h>

// Wifi
const char ssid[] = "";
const char password[] = "";
#include <WiFi.h>
#include <Arduino.h>

void setup()
{
    Serial.begin(115200);
    while(!Serial){delay(100);}

    Serial.println();
    Serial.println("******************************************************");
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

    WiFiClient client;
    PubSubClient mqtt(client);
}


void loop() {
  while(1){}
}