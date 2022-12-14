# Embedded Software

Our embedded software is flashed onto the ESP32 board with a SIM7000G module. The board can be purchased [here][esp32-sim7000g-purchase].

---
## Getting Started
### PlatformIO (Recommended)
PlatformIO is an extension on VSCode that supports embedded software development on VSCode.
It can manage libraries and segment different binaries through environment definitions.

You can install platformIO through the VSCode marketplace.
Once installed, open the `Sentinel Embedded` project through PlatformIO.

### Arduino (Basic, only recommended for simple flashes)
- Install the Arduino IDE [here][arduino-ide-install]
- Follow this [guide][esp32-arduino] to enable your Arduino IDE to flash the ESP32 board.

## Additional Setup on M1 Macs
Download CH9102_Mac_Driver.zip [here][ch9102-mac-driver] in order for your mac to flash the ESP32 board. Not doing this would raise an error during the flashing process.

---
## Reference Guides
- [ESP32 and GPS/GPRS/LTE Tutorial][esp32-tutorial]
- [GPS Tracker][gps-tracker-arduino]
- [AT Command Reference][at_command_reference]

[esp32-sim7000g-purchase]: https://pt.aliexpress.com/i/4000542688096.html?gatewayAdapt=glo2bra
[arduino-ide-install]: https://www.arduino.cc/en/software
[esp32-arduino]: https://randomnerdtutorials.com/installing-esp32-arduino-ide-2-0
[ch9102-mac-driver]: https://github.com/Xinyuan-LilyGO/LilyGo-T-Call-SIM800/issues/139
[esp32-tutorial]: https://randomnerdtutorials.com/lilygo-t-sim7000g-esp32-lte-gprs-gps/
[gps-tracker-arduino]: https://www.hackster.io/botletics/real-time-2g-3g-lte-arduino-gps-tracker-iot-dashboard-01d471
[at_command_reference]: https://www.commfront.com/pages/at-commands#:~:text=AT%20commands%20are%20used%20for,COM%20port%20and%20IP%20parameters.