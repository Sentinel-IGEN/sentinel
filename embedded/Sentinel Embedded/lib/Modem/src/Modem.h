#ifndef __MODEM_HELPER_INCLUDED__
#define __MODEM_HELPER_INCLUDED__

// Set serial for debug console (to the Serial Monitor, default speed 115200)
#define SerialMon Serial

// Set serial for AT commands (to the module)
#define SerialAT Serial1
#define TINY_GSM_MODEM_SIM7000SSL
#define TINY_GSM_RX_BUFFER 1024 // Set RX buffer to 1Kb

#define UART_BAUD 9600
#define PIN_TX 27
#define PIN_RX 26

// GPRS credentials
const char apn[] = "internet.freedommobile.ca";

#include <TinyGsmClient.h>
#include <SPI.h>
#include <Ticker.h>

#define uS_TO_S_FACTOR 1000000ULL // Conversion factor for micro seconds to seconds
#define TIME_TO_SLEEP 60          // Time ESP32 will go to sleep (in seconds)
#define PWR_PIN 4

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
}

#endif