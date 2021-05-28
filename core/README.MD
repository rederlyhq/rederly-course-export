# rederly-course-export core
This subproject is a core logic shared by a cli and a server

# Configurations
* Configurations are read from an environment variables in: src\configurations.ts
* These environment can be set by the system or by a .env file located at the root of this project (gitignored), .env expects key-value pairs with no space (i.e. `SERVER_PORT=8080`)
* You can not include or leave these values blank to get default values (however there is a configuration which defaults to true in production that the app will crash when missing configurations)

### Available configurations

#### Environment
| Environment variable | Description | Default value |
| --- | --- | --- |
| NODE_ENV | This is a standard environment variable which will make libraries behave differently (i.e. express). If set to `production` our application will be less verbose about error responses |  |

#### Configuration handling
| Environment variable | Description | Default value |
| --- | --- | --- |
| LOG_MISSING_CONFIGURATIONS | Whether or not to log missing configurations | true |
| FAIL_ON_MISSING_CONFIGURATIONS | Whether or not to reject the loading promise on missing configurations | true in prod, false in dev |
| CONFIG_SALT | A random seed to better mask the configuration hash |  |

#### Temp files
| Environment variable | Description | Default value |
| --- | --- | --- |
| AUTO_DELETE_TEMP_FILES | Whether or not to delete temp files once done with them, meant for debugging and will log a warning in production | true |

##### Logging Levels
* ERROR
* WARN
* INFO
* HTTP
* VERBOSE
* DEBUG
* SILLY
* null

| Environment variable | Description | Default value |
| --- | --- | --- |
| LOGGING_LEVEL | Fallback logging level for values below that are not provided | debug |
| LOGGING_LEVEL_FOR_FILE | The logging level for use with the file, pass null to turn off file logging | LOGGING_LEVEL |
| LOGGING_LEVEL_FOR_CONSOLE | The logging level for use with the console, pass null to turn off console logging | LOGGING_LEVEL |
| LOGGING_LOG_JSON | Whether or not logs to the console should be formatted or output as json | false in development true in production |

#### Paths
| WORKING_TEMP_DIRECTORY | The location which can be used to store temp files | 'tmp' |
| WEBWORK_FILE_LOCATION | The location which webwork files are located (specifically private should be in this folder) | 'test-webwork-files' |