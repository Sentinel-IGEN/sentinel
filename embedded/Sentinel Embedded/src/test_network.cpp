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

#define LED_PIN 12

void setup()
{
  SerialMon.begin(115200); // Set console baud rate
  delay(10);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH); // Set LED OFF
  Modem::modemPowerOn();
  SerialAT.begin(UART_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);

  delay(10000);

  Serial.println("========INIT========");
  Modem::collectDiagnosisData(modem);
}

void loop()
{
  for (int i = 0; i <= 4; i++)
  {
    uint8_t network[] = {
        2,  /*Automatic*/
        13, /*GSM only*/
        38, /*LTE only*/
        51  /*GSM and LTE only*/
    };
    Serial.printf("Try %d method\n", network[i]);
    modem.setNetworkMode(network[i]);
    delay(3000);
    bool isConnected = false;
    int tryCount = 60;
    while (tryCount--)
    {
      int16_t signal = modem.getSignalQuality();
      Serial.print("Signal Quality: ");
      Serial.print(signal);
      Serial.print(" ");
      Serial.print("isNetworkConnected: ");
      isConnected = modem.isNetworkConnected();
      Serial.println(isConnected ? "CONNECTED" : "NOT CONNECTED");

      if (isConnected)
      {
        if (modem.gprsConnect(apn))
        {
          Serial.println("GPRS connect successful");
        }
        else
        {
          Serial.println("GPRS connect NOT successful");
        }
        break;
      }
      delay(1000);
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    }
    if (isConnected)
    {
      break;
    }
  }
  digitalWrite(LED_PIN, HIGH);

  Serial.println();
  Serial.println("Device is connected!");
  Serial.println();

  while (1)
  {
  }
}