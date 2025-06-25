#!/bin/bash

# @TODO: fetch the user dynamically or from config
export XDG_RUNTIME_DIR=/run/user/1000

IDLE_TIMEOUT=$(jq -r '.page_timeout' /opt/piosk/config.json)

while true
do
	IDLE=$(xprintidle / 1000)
	if [ "$IDLE" -ge "$IDLE_TIMEOUT" ]; then
		curl -X POST http://localhost/refresh
		sleep "$IDLE_TIMEOUT"
	else
		sleep "$("$IDLE_TIMEOUT" - "$IDLE")"
	fi
done
