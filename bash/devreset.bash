#!/bin/bash
docker-compose -f docker-compose-dev.yml run backend /app/dev/initdb.bash
