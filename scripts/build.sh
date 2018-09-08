#!/bin/bash
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD";
docker build -t maxlivinci/graphql-ts-server-boilerplate .;