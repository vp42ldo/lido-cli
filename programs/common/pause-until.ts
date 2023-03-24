import { wrapTx } from '@utils';
import { Command } from 'commander';
import { Contract, MaxUint256, toBeHex } from 'ethers';

export const addPauseUntilSubCommands = (command: Command, contract: Contract) => {
  command
    .command('is-paused')
    .description('returns is contract paused')
    .action(async () => {
      const paused = await contract.isPaused();
      console.log('paused', paused);
    });

  command
    .command('resume')
    .description('resumes the contract')
    .action(async () => {
      await wrapTx(() => contract.resume());
    });

  command
    .command('pause')
    .description('pause the contract')
    .option('-d, --duration <string>', 'pause duration', toBeHex(MaxUint256))
    .action(async (options) => {
      const { duration } = options;
      await wrapTx(() => contract.pause(duration));
    });
};
