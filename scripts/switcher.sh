#!/bin/bash

# @TODO: fetch the user dynamically or from config
export XDG_RUNTIME_DIR=/run/user/1000

IDLE_TIMEOUT=$(jq -r '.page_timeout' /opt/piosk/config.json)
IDLE=$(xprintidle) / 1000

while true
do
	if [ $IDLE -ge $IDLE_TIMEOUT ]; then
    	wtype -M ctrl r -m ctrl
		sleep $IDLE_TIMEOUT
	elif
		sleep $($IDLE_TIMEOUT - $IDLE)
	fi
done
