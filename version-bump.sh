#!/usr/bin/env bash

set -e

VERSION_ARG=$1
[ "$VERSION_ARG" = "" ] && echo "Missing version arg" && exit 1
VERSION_NUMBER="$(npm version "$VERSION_ARG")"
PROJECT_NAME="$(basename "$(pwd)")"

TAG_STRING="$PROJECT_NAME--$VERSION_NUMBER"
git tag "$TAG_STRING" -m "$TAG_STRING"
echo "success $TAG_STRING"