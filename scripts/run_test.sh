#!/bin/bash

NOW=$(date +"%Y%m%d_%H%M%S")
mkdir -p test/load

k6 run scripts/test.js --out json=test/load/results_$NOW.json