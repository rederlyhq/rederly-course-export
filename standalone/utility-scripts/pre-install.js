#!/usr/bin/node

const { spawn } = require('child_process');
const fs = require('fs-extra');

const runCommand = (options) => new Promise((resolve, reject) => {
    const { command, args, cwd } = options;

    const commandString = `${command} ${args.join(' ')}`;
    const child = spawn(command, args, {
        cwd: cwd
    });
    // Get text chunks
    child.stdout.setEncoding('utf8');
    console.log(`[${child.pid}]: ["${commandString}"] started`);
    child.stdout.on('data', (chunk) => {
        console.log(`[${child.pid}] out: ${chunk.toString()}`);
    });
    child.stderr.on('data', (chunk) => {
        console.error(`[${child.pid}] err: ${chunk.toString()}`);
    });
    child.on('close', (code) => {
        console.log(`[${child.pid}]: ["${commandString}"] exited with code ${code}`);
        if (code === 0) {
            resolve();
        } else {
            reject();
        }
    });
    child.on('error', reject);
});

const coreSetup = async () => {
    const pathToCore = '../core';
    const { version: coreVersion } = require(`../${pathToCore}/package.json`);
    const coreLocation = `${pathToCore}/rederly-course-export-${coreVersion}.tgz`;

    if (fs.existsSync(coreLocation)) {
        console.log(`Deleting ${coreLocation}`);
        await fs.remove(coreLocation);
    }

    await runCommand({
        command: 'npm',
        args: ['install'],
        cwd: pathToCore
    });
    await runCommand({
        command: 'npm',
        args: ['run', 'build'],
        cwd: pathToCore
    });
    await runCommand({
        command: 'npm',
        args: ['pack'],
        cwd: pathToCore
    });
    
    await runCommand({
        command: 'npm',
        args: ['install', coreLocation],
    });
};

(async () => {
    await coreSetup();
})();
