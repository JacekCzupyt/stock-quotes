# stock-quotes

A system that will collect and store stock quotes in a relational, normalized database.

## how to run

Run `docker-compose up -d db` or `npm run start:db` to start the database in a docker container, then run `npm run start` to start the application locally.

Alternativly simply run `docker-compose up` or `npm run start:docker` to start both the database and the app in docker containers

Concurency can be tested by first starting the testing database with `npm run start:db`, then initiation the end-to-end tests, by running `npm run test:e2e`
