const os = require('os');
const path = require('path');

const { error } = require('../logger');

const images = require('../images');
const { providers } = require('../providers');
const { providerArg } = require('../args');

exports.command = 'run <name> <image>';
exports.desc = 'Provision a new micro kernel';

exports.builder = yargs => {
    yargs.options({
        cpus: {
            alias: 'c',
            describe: 'number of cpus (default 1)',
            type: 'number'
        },
        memory: {
            alias: 'm',
            describe: 'choose memory size in MB (default 1024)',
            type: 'number'
        },
        bridged: {
            alias: 'b',
            describe: 'enable bridged networking (DHCP IP)',
            type: 'boolean'
        },
        provider: providerArg,
        sync: {
            default: true,
            description: 'whether to mount share the cwd and root with the vm',
            type: 'boolean'
        }
    });
};

exports.handler = async argv => {
    const { image, cpus, memory, name, bridged, provider, sync } = argv;

    if (!await images.exists(image)) {
        error(`${image} image not found`);
        return;
    }

    let info = await images.info(image).catch(e => error(e));
    if (info.providers.indexOf(provider) == -1) {
        error(`Please rebuild ${image} for ${provider}`);
        return;
    }

    let root = (os.platform() == "win32") ? `${process.cwd().split(path.sep)[0]}/` : "/";
    let syncs = sync ? [`${process.cwd()};/slim`, `${root};/host`] : [];

    await providers[provider].create(name, {
        image: image,
        cpus: cpus || info.cpus,
        mem: memory || info.memory,
        bridged,
        syncs,
    }).catch(e => error(e));
};
