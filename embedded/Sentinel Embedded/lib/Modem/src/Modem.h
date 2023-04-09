#ifndef __MODEM_H__
#define __MODEM_H__

// Set serial for debug console (to the Serial Monitor, default speed 115200)
#define SerialMon Serial

// Set serial for AT commands (to the module)
#define SerialAT Serial1
#define TINY_GSM_MODEM_SIM7000SSL
#define TINY_GSM_RX_BUFFER 1024 // Set RX buffer to 1Kb

#define UART_BAUD 9600
#define PIN_TX 27
#define PIN_RX 26
#define MAX_WIFI_SCAN 127

// GPRS credentials
const char apn[] = "internet.freedommobile.ca";
// const char apn[] = "web.wireless.bell.ca";
// const char apn[] = "sp.koodo.com";


#include <TinyGsmClient.h>
#include <SPI.h>
#include <Ticker.h>
#include <WiFi.h>

#define PWR_PIN 4
#define LED_PIN 12

namespace Modem
{
    void enableGPS(TinyGsm modem);
    void disableGPS(TinyGsm modem);
    void modemPowerOn();
    void modemPowerOff();
    void modemRestart();
    void collectDiagnosisData(TinyGsm modem);
    void requestUEInfo(TinyGsm modem);
    void initialize(TinyGsm modem, bool restart = false, bool showInfo = true);
    void checkSimStatus(TinyGsm modem);
    String MACtoString(uint8_t *macAddress);
    bool getSurroundingWiFiJsonAsync(String& locationJSON);
}

#endif