#!/bin/bash

# keep wifi alive

ping -c2 192.168.30.1

if [ $? != 0 ]
then
  ifconfig wlan0 down
  sleep 30
  ifconfig wlan0 up
fi