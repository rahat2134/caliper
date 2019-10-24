/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

const isArray = require('isarray');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const CaliperUtils = require('caliper-core').CaliperUtils;
const commLogger = CaliperUtils.getLogger('common.js');

const Color = {
    error: chalk.red.bold,
    warn: chalk.yellow.bold,
    info: chalk.blue.bold,
    success: chalk.green.bold,
    failure: chalk.red.bold
};
module.exports.Color = Color;

const TxErrorEnum = {
    NoError: 0,
    SendRawTransactionError: 1
};
module.exports.TxErrorEnum = TxErrorEnum;

module.exports.findContractAddress = function(workspaceRoot, smartContracts, contractID) {
    if (!isArray(smartContracts)) {
        commLogger.error(Color.error('smartContracts should be an array'));
        return null;
    }

    let smartContract = smartContracts.find(smartContract => {
        return smartContract.id === contractID;
    });

    if (smartContract === undefined) {
        commLogger.error(Color.error(`Smart contract ${contractID} undefined`));
        return null;
    }

    let contractType = smartContract.language;
    if (contractType === 'solidity') {
        let contractPath = path.join(workspaceRoot, smartContract.path);
        let contractName = path.basename(contractPath, '.sol');

        try {
            let address = fs.readFileSync(path.join(path.dirname(contractPath), `${contractName}.address`)).toString();
            return address;
        } catch (error) {
            if (error.code === 'ENOENT') {
                commLogger.error(Color.error(`Address of smart contract ${smartContract.id} can't be determinied, please install it first!`));
            }
            return null;
        }
    } else if (contractType === 'precompiled') {
        let address = smartContract.address;
        return address;
    } else {
        commLogger.error(Color.error(`Smart contract of ${contractType} is not supported yet`));
        return null;
    }
};