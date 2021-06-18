# rederly-course-export standalone
This subproject is a CLI that can connect to a database to fetch the data and generate an archive for a course

## Core
It uses the logic defined by [../core](../core). This was broken down this way so that an api could also just accept the data and create the archive (as a microservice)


# Configurations
* Configurations are read from an environment variables in: src\configurations.ts
* These environment can be set by the system or by a .env file located at the root of this project (gitignored), .env expects key-value pairs with no space (i.e. `SERVER_PORT=8080`)
* You can not include or leave these values blank to get default values (however there is a configuration which defaults to true in production that the app will crash when missing configurations)

### Available configurations

#### Database
| Environment variable | Description | Default value |
| --- | --- | --- |
| SERVER_PORT | A port to listen on | 3008 |

#### Database
| Environment variable | Description | Default value |
| --- | --- | --- |
| DB_HOST | The host url for the database | localhost |
| DB_PORT | The connection port for the database | 5432 |
| DB_NAME | The name of the database | rederly |
| DB_USER | The user the login to the database | postgres |
| DB_PASSWORD | The password for the user to login to the database | password |
| DB_LOGGING | Whether or not queries should be output, used for debugging | false |
| DB_SYNC | Whether or not to sync with the database | false |
| DB_STATEMENT_TIMEOUT | Number of millis a db query is allowed to take (does not affect transactions) | 60000 |

### Additional configurations
Configurations required by core are located in it's readme [README](../core/README.MD)