#!/bin/bash

NAME=$1
DATE=$(date +"%Y%m%d%H%M%S")

FILENAME="src/migrations/${NAME}_${DATE}"

yarn ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -d src/infra/typeorm/data-source.ts "$FILENAME"
