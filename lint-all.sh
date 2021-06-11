#!/usr/bin/env bash

lint () {
  # Use a subshell so that cd is reversed at the end of the functions
  (
    cd "$(dirname "$0")" || echo "Failed to cd to script dir" || exit 1;
    echo "Running in $1 (from $(pwd))";
    cd "$1" || echo "Failed to cd to project dir" || exit 1;
    # Install dependencies only if they have never been installed
    [ ! -d "node_modules" ] && npm install
    npm run lint
  )
}

PROJECTS=("standalone" "server" "core" "standalone-server");

for PROJECT in "${PROJECTS[@]}"; do
  # Exits if any linting fails
  # lint "$PROJECT" || exit $?;
  lint "$PROJECT";
done
