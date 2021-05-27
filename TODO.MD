1. Move database folder to an npm module so that it can be shared between multiple application (if need be)
  * If an api is created maybe it makes sense for the backend to just send the info
2. Make this a microservice for prod
3. Go through copied files from backend and make sure they are relevant here
  * Strip configurations that don't need to be here
  * Strip constants that don't need to be here