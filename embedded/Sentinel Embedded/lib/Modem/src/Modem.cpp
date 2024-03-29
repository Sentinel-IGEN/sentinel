#include "Modem.h"

namespace Modem
{
    void enableGPS(TinyGsm modem)
    {
        // Set SIM7000G GPIO4 LOW ,turn on GPS power
        // CMD:AT+SGPIO=0,4,1,1
        modem.sendAT("+SGPIO=0,4,1,1");
        if (modem.waitResponse(10000L) != 1)
        {
            DBG(" SGPIO=0,4,1,1 false ");
            Serial.println("Failed to enable GPS");
        }
        modem.enableGPS();
    }

    void disableGPS(TinyGsm modem)
    {
        // Set SIM7000G GPIO4 LOW ,turn off GPS power
        // CMD:AT+SGPIO=0,4,1,0
        modem.sendAT("+SGPIO=0,4,1,0");
        if (modem.waitResponse(10000L) != 1)
        {
            DBG(" SGPIO=0,4,1,0 false ");
            Serial.println("Failed to enable GPS");
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
        delay(5000);
        modemPowerOn();
    }

    void checkSimStatus(TinyGsm modem)
    {
        unsigned long timeout = millis();
        Serial.println("Checking SIM card status...");
        while (modem.getSimStatus() != SIM_READY)
        {
            Serial.print(".");
            if (millis() - timeout > 60000)
            {
                Serial.println("SIM card has not been detected.");
                return;
            }
        }
        Serial.println("SIM card detected!");
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

        // Preferred network band:
        Serial.println("=====Available network bands=====");
        modem.sendAT("+CBANDCFG?");
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
    void initialize(TinyGsm modem, bool restart, bool showInfo)
    {
        bool success = false;
        while (!success)
        {
            // Setup modem
            do
            {
                SerialMon.println("Restarting modem...");
                Modem::modemRestart();
            } while (!modem.testAT());

            // 1 CAT-M
            // 2 NB-IoT
            // 3 CAT-M and NB-IoT
            modem.setPreferredMode(1);

            // Network connection options
            // 2, Automatic
            // 13, GSM only
            // 38, LTE only
            // 51, GSM and LTE only
            modem.setNetworkMode(2);

            // String res;
            // modem.sendAT("+CBANDCFG=\"CAT-M\",4");
            // if (modem.waitResponse(1000L, res) != 1)
            // {
            //     SerialMon.println("Error in setting preferred network band");
            // }

            delay(3000);

            // Check sim status
            checkSimStatus(modem);

            while (!modem.isNetworkConnected())
            {
                SerialMon.println("Attempting to connect to network...");
                SerialMon.println("Signal Quality: " + String(modem.getSignalQuality()));
                digitalWrite(LED_PIN, !digitalRead(LED_PIN));
                delay(1000);
            }
            SerialMon.println("Connecting to " + String(apn));

            if (modem.gprsConnect(apn))
                success = true;
            else
                SerialMon.println("Failed to connect via GPRS");
        }

        SerialMon.println("Connection success!");

        if (showInfo)
        {
            SerialMon.println("Modem Info: " + modem.getModemInfo());
            requestUEInfo(modem);
        }
    }

    String MACtoString(uint8_t *macAddress)
    {
        const int MAC_ADDR_SIZE = 18;
        char macStr[MAC_ADDR_SIZE] = {0};
        snprintf(macStr, MAC_ADDR_SIZE, "%02X:%02X:%02X:%02X:%02X:%02X", macAddress[0], macAddress[1], macAddress[2], macAddress[3], macAddress[4], macAddress[5]);
        return String(macStr);
    }

    /*
     * Scans surrounding wifi networks and formats it as a json object.
     * Returns true when scan is complete.
    */
    bool getSurroundingWiFiJsonAsync(String &locationJSON)
    {
        int n = WiFi.scanComplete();
        if (n == -2)
        {
            WiFi.scanNetworks(true);
        }
        else if (n > 0)
        {
            locationJSON = "[";
            n = min(n, MAX_WIFI_SCAN);
            for (uint8_t i = 0; i < n; i++)
            {
                locationJSON += "{\"macAddress\":\"" + MACtoString(WiFi.BSSID(i)) + "\",";
                locationJSON += "\"signalStrength\":" + String(WiFi.RSSI(i)) + ",";
                locationJSON += "\"channel\":" + String(WiFi.channel(i)) + "}";
                if (i < (n - 1))
                {
                    locationJSON += ",\n";
                }
            }
            WiFi.scanDelete();
            locationJSON += "]";
            return true;
        }
        return false;
    }

}