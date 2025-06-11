#!/bin/bash

# Fetch the latest changes from the remote repository
git fetch origin

# Get the current local commit hash
local_commit=$(git rev-parse HEAD)

# Get the local branch name
local_branch=$(git rev-parse --abbrev-ref HEAD)

# Get the latest remote commit hash
remote_commit=$(git rev-parse origin/$local_branch)

# Compare the two hashes
if [ "$local_commit" = "$remote_commit" ]; then
  echo "PiOSK:$local_branch is up to date."
elif git merge-base --is-ancestor "$local_commit" "$remote_commit"; then
  echo "There is an update available for PiOSK:$local_branch."
else
  echo "The local PiOSK is ahead of the online version. Fix this by connecting to ssh and running `git reset --hard origin/$local_branch`"
fi