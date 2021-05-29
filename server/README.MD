# rederly-course-export server
This subproject is a server that generates an export from the sent data

## Core
It uses the logic defined by [../core](../core). This was broken down this way so that an api could also just accept the data and create the archive (as a microservice)

# Generating schema request type
## Intended method
Since there is only one schema and json in the project does not copy over with the build I just wanted to keep it in typescript  
This would have worked for that except for a bug in json-schema-to-typescript  
https://github.com/bcherny/json-schema-to-typescript/issues/391  
npx ts-node -e "console.log(JSON.stringify(require('./src/validations').postCourseBodySchema))" | npx json2ts
## Workaround
* npx ts-node -e "console.log(JSON.stringify(require('./src/validations').postCourseBodySchema))" > temp.json
* npx json2ts temp.json > src/request-types.d.ts
* Rename `temp` to `PostCourseBodySchema`

# Configurations
* Configurations are read from an environment variables in: src\configurations.ts
* These environment can be set by the system or by a .env file located at the root of this project (gitignored), .env expects key-value pairs with no space (i.e. `SERVER_PORT=8080`)
* You can not include or leave these values blank to get default values (however there is a configuration which defaults to true in production that the app will crash when missing configurations)

### Available configurations

#### Server
| Environment variable | Description | Default value |
| --- | --- | --- |
| SERVER_PORT | The connection port for the server | 3008 |

### Additional configurations
Configurations required by core are located in it's readme [README](../core/README.MD)