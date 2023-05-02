import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";

// this code will be run on the node
const litActionCode = `
const go = async () => {
  // test an access control condition
  const testResult = await Lit.Actions.checkConditions({conditions, authSig, chain})

  console.log('testResult', testResult)

  // only sign if the access condition is true
  if (!testResult){
    return;
  }

  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
};



go();
`;

// you need an AuthSig to auth with the nodes
// normally you would obtain an AuthSig by calling LitJsSdk.checkAndSignAuthMessage({chain})
const authSig = {
    sig: '0xeb271a2a695b7bc3655c89919ba45469ed006ab48f2669cf30ac16c16e4f72b2502aa1d6b49b9679a7ce2e6417183172b944f5e915a5a0034a045abcb4740e5a1c',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: 'localhost:1210 wants you to sign in with your Ethereum account:\n' +
      '0xeE52f6E8F8F075Bb6119958c1ACeB16C788e57d6\n' +
      '\n' +
      '\n' +
      'URI: http://localhost:1210/auth\n' +
      'Version: 1\n' +
      'Chain ID: 1\n' +
      'Nonce: 4L08882G7gyr5UNAo\n' +
      'Issued At: 2023-04-19T23:41:46.774Z\n' +
      'Expiration Time: 2023-04-20T23:41:46.759Z',
    address: '0xee52f6e8f8f075bb6119958c1aceb16c788e57d6'
  };

const runLitAction = async () => {
    const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
        litNetwork: "serrano",
    });
    await litNodeClient.connect();
    const signatures = await litNodeClient.executeJs({
        code: litActionCode,
        authSig,
        jsParams: {
            toSign: "[72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]",
            publicKey:
                "0x044f9cbd78601c7ef5e4f95f43ddd3ad100782f2a5bec51032128af4a226f82b57342bea3371be09d3f88c7b26d954cf38e9bfca41d4399038d77174f6e809e07f",
            sigName: "sig1",
            conditions: [
                {
                    conditionType: "evmBasic",
                    contractAddress: "",
                    standardContractType: "",
                    chain: "ethereum",
                    method: "eth_getBalance",
                    parameters: [":userAddress", "latest"],
                    returnValueTest: {
                        comparator: ">=",
                        value: "1",
                    },
                },
            ],
            authSig: {
                sig: '0xeb271a2a695b7bc3655c89919ba45469ed006ab48f2669cf30ac16c16e4f72b2502aa1d6b49b9679a7ce2e6417183172b944f5e915a5a0034a045abcb4740e5a1c',
                derivedVia: 'web3.eth.personal.sign',
                signedMessage: 'localhost:1210 wants you to sign in with your Ethereum account:\n' +
                  '0xeE52f6E8F8F075Bb6119958c1ACeB16C788e57d6\n' +
                  '\n' +
                  '\n' +
                  'URI: http://localhost:1210/auth\n' +
                  'Version: 1\n' +
                  'Chain ID: 1\n' +
                  'Nonce: 4L08882G7gyr5UNAo\n' +
                  'Issued At: 2023-04-19T23:41:46.774Z\n' +
                  'Expiration Time: 2023-04-20T23:41:46.759Z',
                address: '0xee52f6e8f8f075bb6119958c1aceb16c788e57d6'
              },
            chain: "ethereum",
        },
    });
    console.log("signatures: ", signatures);
};

runLitAction();