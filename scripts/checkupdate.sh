#!/bin/bash

# Fetch the latest changes from the remote repository
git fetch origin

# Get the current local commit hash
local_commit=$(git rev-parse HEAD)

# Get the latest remote commit hash
remote_commit=$(git rev-parse origin/main)

# Compare the two hashes
if [ "$local_commit" = "$remote_commit" ]; then
  echo "PiOSK is up to date."
elif git merge-base --is-ancestor "$local_commit" "$remote_commit"; then
  echo "There is an update available for PiOSK."
else
  echo "The local PiOSK is ahead of the online version."
fi