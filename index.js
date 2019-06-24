#!/usr/bin/env node
const yargs       = require('yargs');
const { version } = require('./package.json');
const { error } = require('./lib/logger');

// initialize environment via dotenv
require('dotenv').config();

// set environment to production in case no .env file could be loaded
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
}

// make sure required environemnt variables are set
if (!process.env.SYSLINUX_ARCHIVE_DOWNLOAD_URL || !process.env.RSA_KEY_BASE_URL) {
    error('Missing required environment variables! Make sure your environment is configured correctly before running slim!');
    process.exit(1);
}

const { check } = require('./lib/dependencies');
const env = require('./lib/env');

// Environment reset/sanity check
// - prereqs
// - permissions
// - required files
(async () => {
    await env.setup();

    yargs
        .middleware(check)
        .commandDir('./lib/commands')
        .version()
        .epilog(version ? `Version: ${version}`: '')
        .demandCommand(1, 'Did you forget to specify a command?')
        .recommendCommands()
        .showHelpOnFail(false, 'Specify --help for available options')
        .strict(true)
        .help()
        .wrap(yargs.terminalWidth())
        .argv
})();
