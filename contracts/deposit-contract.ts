import { Contract } from 'ethers';
import { wallet } from '@provider';
import { getDeployedAddress } from '@configs';
import abi from 'abi/DepositContract.json';

export const depositAddress = getDeployedAddress('depositContract');
export const depositContract = new Contract(depositAddress, abi, wallet);
