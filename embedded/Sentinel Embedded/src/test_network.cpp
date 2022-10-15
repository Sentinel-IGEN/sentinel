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
  modemPowerOn();
  SerialAT.begin(UART_BAUD, SERIAL_8N1, PIN_RX, PIN_TX);

  Serial.println("/**********************************************************/");
  Serial.println("To initialize the network test, please make sure your LTE ");
  Serial.println("antenna has been connected to the SIM interface on the board.");
  Serial.println("/**********************************************************/\n\n");

  delay(10000);
}

void loop()
{
  String res;
  Serial.println("========INIT========");

  if (!modem.init())
  {
    modemRestart();
    delay(2000);
    Serial.println("Failed to restart modem, attempting to continue without restarting");
    return;
  }

  Serial.println("========SIMCOMATI======");
  modem.sendAT("+SIMCOMATI");
  modem.waitResponse(1000L, res);
  res.replace(GSM_NL "OK" GSM_NL, "");
  Serial.println(res);
  res = "";
  Serial.println("=======================");

  Serial.println("=====Preferred mode selection=====");
  modem.sendAT("+CNMP?");
  if (modem.waitResponse(1000L, res) == 1)
  {
    res.replace(GSM_NL "OK" GSM_NL, "");
    Serial.println(res);
  }
  res = "";
  Serial.println("=======================");

  Serial.println("=====Preferred selection between CAT-M and NB-IoT=====");
  modem.sendAT("+CMNB?");
  if (modem.waitResponse(1000L, res) == 1)
  {
    res.replace(GSM_NL "OK" GSM_NL, "");
    Serial.println(res);
  }
  res = "";
  Serial.println("=======================");

  String name = modem.getModemName();
  Serial.println("Modem Name: " + name);

  String modemInfo = modem.getModemInfo();
  Serial.println("Modem Info: " + modemInfo);

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
  Serial.println("Device is connected .");
  Serial.println();

  Serial.println("=====Inquiring UE system information=====");
  modem.sendAT("+CPSI?");
  if (modem.waitResponse(1000L, res) == 1)
  {
    res.replace(GSM_NL "OK" GSM_NL, "");
    Serial.println(res);
  }

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