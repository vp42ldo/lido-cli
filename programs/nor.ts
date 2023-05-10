import { program } from '@command';
import { norContract } from '@contracts';
import { authorizedCall, contractCallTxWithConfirm, formatDate } from '@utils';
import { addAragonAppSubCommands, addLogsCommands, addParsingCommands } from './common';
import { getPenalizedOperators } from './staking-module';

const nor = program.command('nor').description('interact with node operator registry contract');
addAragonAppSubCommands(nor, norContract);
addParsingCommands(nor, norContract);
addLogsCommands(nor, norContract);

nor
  .command('operators')
  .description('returns operators count')
  .action(async () => {
    const total = await norContract.getNodeOperatorsCount();
    console.log('total', total);
  });

nor
  .command('operator')
  .description('returns operator')
  .argument('<operator-id>', 'operator id')
  .action(async (operatorId) => {
    const operator = await norContract.getNodeOperator(operatorId, true);
    console.log('operator', operator.toObject());
  });

nor
  .command('operator-summary')
  .description('returns operator summary')
  .argument('<operator-id>', 'operator id')
  .action(async (operatorId) => {
    const summary = await norContract.getNodeOperatorSummary(operatorId);
    console.log('operator summary', summary.toObject());
  });

nor
  .command('add-operator')
  .description('adds node operator')
  .option('-n, --name <string>', 'operator name')
  .option('-a, --address <string>', 'reward address')
  .action(async (options) => {
    const { name, address } = options;
    await authorizedCall(norContract, 'addNodeOperator', [name, address]);
  });

nor
  .command('key')
  .description('returns signing key')
  .argument('<operator-id>', 'operator id')
  .argument('<key-id>', 'key id')
  .action(async (operatorId, keyId) => {
    const keyData = await norContract.getSigningKey(Number(operatorId), Number(keyId));
    console.log('key', keyData);
  });

nor
  .command('add-keys')
  .description('adds signing keys')
  .option('-o, --operator-id <number>', 'node operator id')
  .option('-c, --count <number>', 'keys count')
  .option('-p, --public-keys <string>', 'public keys')
  .option('-s, --signatures <string>', 'signatures')
  .action(async (options) => {
    const { operatorId, count, publicKeys, signatures } = options;
    await authorizedCall(norContract, 'addSigningKeys', [operatorId, count, publicKeys, signatures]);
  });

nor
  .command('remove-keys')
  .description('removes signing keys')
  .option('-o, --operator-id <number>', 'node operator id')
  .option('-i, --from-index <number>', 'from index')
  .option('-c, --count <number>', 'keys count')
  .action(async (options) => {
    const { operatorId, fromIndex, count } = options;
    await authorizedCall(norContract, 'removeSigningKeys', [Number(operatorId), Number(fromIndex), Number(count)]);
  });

nor
  .command('set-limit')
  .description('sets staking limit')
  .option('-o, --operator-id <number>', 'node operator id')
  .option('-l, --limit <number>', 'staking limit')
  .action(async (options) => {
    const { operatorId, limit } = options;
    await authorizedCall(norContract, 'setNodeOperatorStakingLimit', [operatorId, limit]);
  });

nor
  .command('penalized-operators')
  .description('returns penalties for all operators')
  .action(async () => {
    const penalizedOperators = await getPenalizedOperators();

    if (!penalizedOperators.length) {
      console.log('no penalized operators');
      return;
    }

    const formattedOperators = penalizedOperators.map((operator) => {
      const { operatorId, name, isPenaltyClearable } = operator;
      const refunded = operator.refundedValidatorsCount;
      const stuck = operator.stuckValidatorsCount;
      const penaltyEndDate = formatDate(new Date(Number(operator.stuckPenaltyEndTimestamp) * 1000));

      return {
        operatorId,
        name,
        refunded,
        stuck,
        penaltyEndDate,
        isPenaltyClearable,
      };
    });

    console.table(formattedOperators);
  });

nor
  .command('clear-penalty')
  .description('clears node operator penalty')
  .argument('<operator-id>', 'operator id')
  .action(async (operatorId) => {
    await contractCallTxWithConfirm(norContract, 'clearNodeOperatorPenalty', [operatorId]);
  });

nor
  .command('clear-penalties')
  .description('clears node operator penalty')
  .action(async () => {
    const penalizedOperators = await getPenalizedOperators();

    if (!penalizedOperators.length) {
      console.log('no penalized operators');
      return;
    }

    for (const operator of penalizedOperators) {
      console.log('operator is penalized', operator.operatorId, operator.name);
      console.log('current time', formatDate(new Date()));
      console.log('penalty end time', formatDate(new Date(Number(operator.stuckPenaltyEndTimestamp) * 1000)));

      if (operator.isPenaltyClearable) {
        console.log('penalty can be cleared');
        await contractCallTxWithConfirm(norContract, 'clearNodeOperatorPenalty', [operator.operatorId]);
      } else {
        console.log('penalty is not clearable');
      }
    }

    console.log('all operators are checked');
  });
