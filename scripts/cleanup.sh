#!/bin/bash
set -e

# Installation directory
PIOSK_DIR="/opt/piosk"

RESET='\033[0m'      # Reset to default
ERROR='\033[1;31m'   # Bold Red
SUCCESS='\033[1;32m' # Bold Green
WARNING='\033[1;33m' # Bold Yellow
INFO='\033[1;34m'    # Bold Blue
CALLOUT='\033[1;35m' # Bold Magenta
DEBUG='\033[1;36m'   # Bold Cyan

echo -e "${INFO}Checking superuser privileges...${RESET}"
if [ "$EUID" -ne 0 ]; then
	echo -e "${ERROR}Not running as superuser. Escalating...${RESET}"

	sudo "$0" "$@" # Re-execute the script as superuser
	exit $?        # Exit with the status of the sudo command
fi

echo -e "${INFO}Backing up configuration...${RESET}"
cp /opt/piosk/config.json /opt/piosk.config.bak

echo -e "${INFO}Stopping PiOSK services...${RESET}"
systemctl stop piosk-runner
systemctl stop piosk-switcher
systemctl stop piosk-dashboard
systemctl stop piosk-wlan0pwr

echo -e "${INFO}Disabling PiOSK services...${RESET}"
systemctl disable piosk-runner
systemctl disable piosk-switcher
systemctl disable piosk-dashboard
systemctl disable piosk-wlan0pwr

echo -e "${INFO}Removing PiOSK services...${RESET}"
rm /etc/systemd/system/piosk-runner.service
rm /etc/systemd/system/piosk-switcher.service
rm /etc/systemd/system/piosk-dashboard.service
rm /etc/systemd/system/piosk-wlan0pwr.service

echo -e "${INFO}Removing PiOSK cron tasks...${RESET}"
rm /etc/cron.d/piosk

echo -e "${INFO}Reloading systemd daemons...${RESET}"
systemctl daemon-reload

echo -e "${INFO}Removing PiOSK directory...${RESET}"
rm -rf /opt/piosk

echo -e "${CALLOUT}Successfully uninstalled PiOSK.${RESET}"
