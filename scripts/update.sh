#!/bin/bash
set -e

# Installation directory
PIOSK_DIR="/opt/piosk"

RESET='\033[0m'			# Reset to default
ERROR='\033[1;31m'		# Bold Red
SUCCESS='\033[1;32m'	# Bold Green
WARNING='\033[1;33m'	# Bold Yellow
INFO='\033[1;34m'		# Bold Blue
CALLOUT='\033[1;35m'	# Bold Magenta
DEBUG='\033[1;36m'		# Bold Cyan

echo -e "${INFO}Checking superuser privileges...${RESET}"
if [ "$EUID" -ne 0 ]; then
	echo -e "${DEBUG}Escalating privileges as superuser...${RESET}"

	sudo "$0" "$@"	# Re-execute the script as superuser
	exit $?			# Exit with the status of the sudo command
fi

echo -e "${INFO}Updating Repo...${RESET}"
cd $PIOSK_DIR
git pull

echo -e "${INFO}Installing PiOSK services...${RESET}"
PI_USER="$SUDO_USER"
PI_SUID=$(id -u "$SUDO_USER")
PI_HOME=$(eval echo ~"$SUDO_USER")

sed -e "s|PI_HOME|$PI_HOME|g" \
	-e "s|PI_SUID|$PI_SUID|g" \
	-e "s|PI_USER|$PI_USER|g" \
	"$PIOSK_DIR/services/piosk-runner.template" > "/etc/systemd/system/piosk-runner.service"

sed -e "s|PI_HOME|$PI_HOME|g" \
	-e "s|PI_SUID|$PI_SUID|g" \
	-e "s|PI_USER|$PI_USER|g" \
	"$PIOSK_DIR/services/piosk-switcher.template" > "/etc/systemd/system/piosk-switcher.service"

cp "$PIOSK_DIR/services/piosk-dashboard.template" /etc/systemd/system/piosk-dashboard.service
cp "$PIOSK_DIR/services/piosk-video.template" /etc/systemd/system/piosk-video.service
cp "$PIOSK_DIR/services/piosk-wlan0pwr.template" /etc/systemd/system/piosk-wlan0pwr.service

echo -e "${INFO}Reloading systemd daemons...${RESET}"
systemctl daemon-reload

echo -e "${INFO}Enabling PiOSK daemons...${RESET}"
systemctl enable piosk-runner
systemctl enable piosk-switcher
systemctl enable piosk-dashboard
#systemctl enable piosk-video
systemctl enable piosk-wlan0pwr

echo -e "${INFO}Starting PiOSK daemons...${RESET}"
# The runner and switcher services are meant to be started after reboot
# systemctl start piosk-runner
# systemctl start piosk-switcher
systemctl start piosk-dashboard
#systemctl start piosk-video

echo -e "${SUCCESS}\tUpdate done! Restarting...${RESET}"
reboot