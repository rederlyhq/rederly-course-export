#!/usr/bin/env bash
VERSION_NUMBER="$(npm version "$1")"
PROJECT_NAME="$(basename "$(pwd)")"

git tag "$PROJECT_NAME--$VERSION_NUMBER"