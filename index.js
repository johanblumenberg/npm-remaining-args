#!/usr/bin/env node

if (process.env.npm_config_argv) {
    console.log(JSON.parse(process.env.npm_config_argv).remain.join(' '));
}
