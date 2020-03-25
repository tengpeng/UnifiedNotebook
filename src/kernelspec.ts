import { KernelSpecManager } from '@jupyterlab/services';
import { createLogger } from 'bunyan'
const log = createLogger({ name: 'kernelspec' })

export const getKernelSpecsList = async () => {
    log.info('Get the list of kernel specs');
    let kernelSpecManager = new KernelSpecManager();

    await kernelSpecManager.ready;

    let kernelSpecs = kernelSpecManager.specs;

    log.info(`Default spec: ${kernelSpecs?.default}`);
    log.info(`Available specs: ${Object.keys(kernelSpecs?.kernelspecs ?? {})}`);
}
