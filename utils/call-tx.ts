import chalk from 'chalk';
import { AbstractSigner, Contract, ContractTransactionResponse } from 'ethers';
import { confirmTx } from './confirm-tx';

export const contractCallTxWithConfirm = async (contract: Contract, method: string, args: unknown[]) => {
  const confirmed = await contractCallConfirm(contract, method, args);
  if (!confirmed) return null;

  return await contractCallTx(contract, method, args);
};

export const contractCallConfirm = async (contract: Contract, method: string, args: unknown[]) => {
  const provider = contract.runner?.provider;

  if (!provider) {
    throw new Error('Provider is not set');
  }

  if (!(contract.runner instanceof AbstractSigner)) {
    throw new Error('Runner is not a signer');
  }

  const signer = contract.runner;
  const from = await signer.getAddress();

  const network = await provider.getNetwork();
  const to = await contract.getAddress();

  const parsedArgs = args.map((arg) =>
    JSON.stringify(arg, (_key, value) => (typeof value === 'bigint' ? value.toString() : value)),
  );

  return confirmTx(network.name, from, to, `${method}(${parsedArgs})`);
};

export const contractCallTx = async (contract: Contract, method: string, args: unknown[]) => {
  const tx: ContractTransactionResponse = await contract[method](...args);
  console.log('tx sent', chalk.green(tx.hash));

  console.log('waiting for tx to be mined...');
  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error('Transaction receipt is not available');
  }

  try {
    console.log('tx logs:');

    receipt.logs.forEach((log) => {
      const parsedLog = contract.interface.parseLog({
        data: log.data,
        topics: log.topics as string[],
      });
      console.log(parsedLog);
    });
  } catch (error) {
    console.log('failed to parse logs');
  }

  return [tx, receipt] as const;
};
