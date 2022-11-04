#include <Modem.h>
#include <SPI.h>
#include <Ticker.h>

#ifdef DUMP_AT_COMMANDS
#include <StreamDebugger.h>
StreamDebugger debugger(SerialAT, SerialMon);
TinyGsm modem(debugger);
#else
TinyGsm modem(SerialAT);
#endif

#define UART_BAUD 9600
#define PIN_DTR 25
#define PIN_TX 27
#define PIN_RX 26
#define LED_PIN 12

void setup()
{
    SerialMon.begin(115200); // Set console baud rate
    delay(10);
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, HIGH); // Set LED OFF

    Modem::initialize(modem);

    SerialAT.begin(UART_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);

    Serial.println("/**********************************************************/");
    Serial.println("To initialize the network test, please make sure your GPS");
    Serial.println("antenna has been connected to the GPS port on the board.");
    Serial.println("/**********************************************************/\n\n");

    delay(10000);
}

void loop()
{
    Serial.println("Start positioning . Make sure to locate outdoors.");
    Serial.println("The blue indicator light flashes to indicate positioning.");

    Modem::enableGPS(modem);

    Serial.println("Waiting for network connection...");
    modem.setNetworkMode(2);
    delay(3000);
    while (!modem.isNetworkConnected())
    {
        delay(1000);
        Serial.println("Waiting for network to be connected...");
    }
    float lat, lon;
    while (1)
    {
        if (modem.getGPS(&lat, &lon))
        {
            Serial.println("The location has been locked, the latitude and longitude are:");
            Serial.print("latitude:");
            Serial.println(lat);
            Serial.print("longitude:");
            Serial.println(lon);
            break;
        }
        digitalWrite(LED_PIN, !digitalRead(LED_PIN));
        delay(2000);
    }

    Modem::disableGPS(modem);

    Serial.println("/**********************************************************/");
    Serial.println("After the network test is complete, please enter the  ");
    Serial.println("AT command in the serial terminal.");
    Serial.println("/**********************************************************/\n\n");

    while (1)
    {
        while (SerialAT.available())
        {
            SerialMon.write(SerialAT.read());
        }
        while (SerialMon.available())
        {
            SerialAT.write(SerialMon.read());
        }
    }
}