#!/bin/bash
set -e

# Installation directory
PIOSK_DIR="/opt/piosk"

echo -e "Checking superuser privileges..."
if [ "$EUID" -ne 0 ]; then
	echo -e "Escalating privileges as superuser..."

	sudo "$0" "$@"	# Re-execute the script as superuser
	exit $?			# Exit with the status of the sudo command
fi

echo -e "Updating Repo..."
cd $PIOSK_DIR
git pull

npm i

echo -e "Installing PiOSK services..."
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

sed -e "s|PI_HOME|$PI_HOME|g" \
	-e "s|PI_SUID|$PI_SUID|g" \
	-e "s|PI_USER|$PI_USER|g" \
	"$PIOSK_DIR/services/piosk-dashboard.template" > "/etc/systemd/system/piosk-dashboard.service"

cp "$PIOSK_DIR/services/piosk-wlan0pwr.template" /etc/systemd/system/piosk-wlan0pwr.service

echo -e "Reloading systemd daemons..."
systemctl daemon-reload

echo -e "Enabling PiOSK daemons..."
systemctl enable piosk-runner
systemctl enable piosk-switcher
systemctl enable piosk-dashboard
systemctl enable piosk-wlan0pwr

echo -e "Starting PiOSK daemons..."
# The runner and switcher services are meant to be started after reboot
# systemctl start piosk-runner
# systemctl start piosk-switcher
systemctl start piosk-dashboard

#echo -e "${SUCCESS}\tUpdate done! Restarting..."
#reboot