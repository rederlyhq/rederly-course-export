#!/usr/bin/env bash

set -e

VERSION_ARG=$1
[ "$VERSION_ARG" = "" ] && echo "Missing version arg" && exit 1
PROJECT_NAME="$(basename "$(pwd)")"

[ "$(git diff --stat)" != '' ] && echo 'Cannot version bump when working copy is dirty' && exit 1
VERSION_NUMBER="$(npm version "$VERSION_ARG")"
TAG_STRING="$PROJECT_NAME--$VERSION_NUMBER"

git add .
git commit -m "Version bump: $TAG_STRING"

git tag "$TAG_STRING" -m "$TAG_STRING"
echo "success $TAG_STRING"