# rederly-course-export standalone-server
This is a convenience server that combines the server and the microservice. The microservice does not include a connection to the database to keep it more versatile and keep the databse more secure.

## Local dependencies
It uses the logic defined by [../standalone](../standalone) and [../core](../core). This was broken down this way to reuse logic.

# Test local dependencies
When all new files are staged or committed you can use this command to make sure building and running will work for production
```bash
(cd .. && git clean -xfd) && npm install && npm run build && npm run prune-production && npm run run:build -- noop
```

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
Configurations required by standalone are located in it's readme [README](../standalone/README.MD)