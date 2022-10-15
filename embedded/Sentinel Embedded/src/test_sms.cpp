#include <Modem.h>

#define UART_BAUD 9600
#define PIN_TX 27
#define PIN_RX 26
#define LED_PIN 12

// See all AT commands, if wanted
// #define DUMP_AT_COMMANDS

#ifdef DUMP_AT_COMMANDS
#include <StreamDebugger.h>
StreamDebugger debugger(SerialAT, SerialMon);
TinyGsm modem(debugger);
#else
TinyGsm modem(SerialAT);
#endif

#define PHONE_NUMBER "+16049109482"

void setup()
{
    SerialMon.begin(115200);
    delay(10);
    modemPowerOn();

    SerialAT.begin(UART_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);

    Serial.println("/**********************************************************/");
    Serial.println("SMS Tester");
    Serial.println("This will send a single message to the targeted phone number.");
    Serial.println("/**********************************************************/\n\n");

    delay(10000);
}

void loop()
{
    if (!modem.testAT())
    {
        Serial.println("Failed to restart modem, attempting to continue without restarting");
        modemRestart();
        return;
    }

    Serial.println("Waiting for network connection...");
    delay(3000);
    int cycleCount = 100;
    while (!modem.isNetworkConnected() && cycleCount-- > 0)
    {
        delay(1000);
        Serial.println("Waiting for network to be connected...");
    }

    if (cycleCount == 0)
    {
        Serial.println("Failed to connect to network, attempting to try again...");
        return;
    }

    modem.sendSMS(PHONE_NUMBER, "Please text me on WhatsApp if text is received; Testing for project.");
    Serial.println("Sent message!");

    Serial.println("/***************************/");
    Serial.println("SMS Test Complete");
    Serial.println("/***************************/\n\n");

    while (1)
    {
    }
}