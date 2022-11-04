#include "Modem.h"

namespace Modem
{
    void enableGPS(TinyGsm modem)
    {
        // Set SIM7000G GPIO4 LOW ,turn on GPS power
        // CMD:AT+SGPIO=0,4,1,1
        // Only in version 20200415 is there a function to control GPS power
        modem.sendAT("+SGPIO=0,4,1,1");
        if (modem.waitResponse(10000L) != 1)
        {
            DBG(" SGPIO=0,4,1,1 false ");
        }
        modem.enableGPS();
    }

    void disableGPS(TinyGsm modem)
    {
        // Set SIM7000G GPIO4 LOW ,turn off GPS power
        // CMD:AT+SGPIO=0,4,1,0
        // Only in version 20200415 is there a function to control GPS power
        modem.sendAT("+SGPIO=0,4,1,0");
        if (modem.waitResponse(10000L) != 1)
        {
            DBG(" SGPIO=0,4,1,0 false ");
        }
        modem.disableGPS();
    }

    void modemPowerOn()
    {
        pinMode(PWR_PIN, OUTPUT);
        digitalWrite(PWR_PIN, LOW);
        delay(1000); // Datasheet Ton mintues = 1S
        digitalWrite(PWR_PIN, HIGH);
    }

    void modemPowerOff()
    {
        pinMode(PWR_PIN, OUTPUT);
        digitalWrite(PWR_PIN, LOW);
        delay(1500); // Datasheet Ton mintues = 1.2S
        digitalWrite(PWR_PIN, HIGH);
    }

    void modemRestart()
    {
        modemPowerOff();
        delay(1000);
        modemPowerOn();
    }

    /*
     * Sends AT commands to SIM7000G to diagnose modem details.
     * Check https://techship.com/faq/how-to-collect-initial-diagnostics-data-for-simcom-sim7000-series-cellular-modules-when-requesting-technical-support/
     * for more information.
     */
    void collectDiagnosisData(TinyGsm modem)
    {
        String res;
        if (!modem.init())
        {
            modemRestart();
            delay(2000);
            Serial.println("Failed to restart modem, attempting to continue without restarting");
            return;
        }

        // Detailed module version info
        Serial.println("========SIMCOMATI======");
        modem.sendAT("+SIMCOMATI");
        modem.waitResponse(1000L, res);
        res.replace(GSM_NL "OK" GSM_NL, "");
        Serial.println(res);
        res = "";
        Serial.println("=======================");

        // Preferred Network Mode
        Serial.println("=====Preferred mode selection=====");
        modem.sendAT("+CNMP?");
        if (modem.waitResponse(1000L, res) == 1)
        {
            res.replace(GSM_NL "OK" GSM_NL, "");
            Serial.println(res);
        }
        res = "";
        Serial.println("=======================");

        // Preferred order CAT-M and NB-IoT:
        Serial.println("=====Preferred selection between CAT-M and NB-IoT=====");
        modem.sendAT("+CMNB?");
        if (modem.waitResponse(1000L, res) == 1)
        {
            res.replace(GSM_NL "OK" GSM_NL, "");
            Serial.println(res);
        }
        res = "";
        Serial.println("=======================");

        Serial.println("Modem Name: " + modem.getModemName());
        Serial.println("Modem Info: " + modem.getModemInfo());
    }

    void requestUEInfo(TinyGsm modem)
    {
        String res;
        Serial.println("=====Inquiring UE system information=====");
        modem.sendAT("+CPSI?");
        if (modem.waitResponse(1000L, res) == 1)
        {
            res.replace(GSM_NL "OK" GSM_NL, "");
            Serial.println(res);
        }
    }

    /*
     * Initializes modem and attempts to establish cellular connection automatically.
     * Will block until success and prints out modem information on success.
     */
    void initialize(TinyGsm modem)
    {
        SerialMon.println("=== Initializing modem ===");
        modemPowerOn();

        if (!modem.init())
        {
            Modem::modemRestart();
            delay(2000);
            Serial.println("Failed to restart modem, attempting to continue without restarting");
        }

        modem.setNetworkMode(2); // Set to automatic connection
        while (!modem.gprsConnect(apn))
        {
            SerialMon.println("Failed to connect via GPRS, retrying...");
            Serial.print("Signal Quality: " + String(modem.getSignalQuality()));
        }
        SerialMon.println("Connection success!");

        SerialMon.print("Modem Info: " + modem.getModemInfo());
        requestUEInfo(modem);
    }

    /*
     * Checks connection status, attempts to reconnect on failure.
     */
    void checkConnection(TinyGsm modem)
    {
        // Make sure we're still registered on the network
        if (!modem.isNetworkConnected())
        {
            SerialMon.println("Network disconnected");
            if (!modem.waitForNetwork(180000L))
            {
                SerialMon.println("Network failure...");
                delay(10000);
                return;
            }
            if (modem.isNetworkConnected())
            {
                SerialMon.println("Network re-connected");
            }

            // Make sure GPRS is still connected
            if (!modem.isGprsConnected())
            {
                SerialMon.print(F("Connecting to "));
                SerialMon.print(apn);
                if (!modem.gprsConnect(apn))
                {
                    SerialMon.println("Reconnection failed...");
                    delay(10000);
                    return;
                }
            }
        }
    }
}