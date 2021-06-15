# rederly-course-export
This is a set of projects for use to creating rederly course exports.

# Version bumping
Version bump each of the packages once changes are done. Automatic tagging is turned of since this is a mono repo and should be tagged in the following way: `${name}--v${version_number}`.  
Example: `standalone-server--v0.5.1`

## Tag script
## core
[core](./core) contains core logic for creating the rederly course archive

## standalone
[standalone](./standalone) handles a database fetch and calls core, for use as a cli

## server
[server](./server) opens a server to accept data to send to core. This would be the micro service approach

## standalone-server
[standalone-server](./standalone-server) opens a server to accept data to send to core. This is less prefered since it requires more logic and a database connection, the normal server is dumb and just takes the data.
