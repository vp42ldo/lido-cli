import { program } from '@command';
import { accountingOracleContract } from '@contracts';
import {
  addAccessControlSubCommands,
  addBaseOracleCommands,
  addOssifiableProxyCommands,
  addParsingCommands,
} from './common';

const oracle = program.command('accounting-oracle').description('interact with accounting oracle contract');
addAccessControlSubCommands(oracle, accountingOracleContract);
addBaseOracleCommands(oracle, accountingOracleContract);
addOssifiableProxyCommands(oracle, accountingOracleContract);
addParsingCommands(oracle, accountingOracleContract);

oracle
  .command('extra-data-format')
  .description('returns extra data format')
  .action(async () => {
    const format = await accountingOracleContract.EXTRA_DATA_FORMAT_LIST();
    console.log('extra data format', format);
  });

oracle
  .command('extra-data-type-stuck')
  .description('returns extra type for stuck validators')
  .action(async () => {
    const format = await accountingOracleContract.EXTRA_DATA_TYPE_STUCK_VALIDATORS();
    console.log('type stuck', format);
  });

oracle
  .command('extra-data-type-exited')
  .description('returns extra type for exited validators')
  .action(async () => {
    const format = await accountingOracleContract.EXTRA_DATA_TYPE_EXITED_VALIDATORS();
    console.log('type exited', format);
  });
