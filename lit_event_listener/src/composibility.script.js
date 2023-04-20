import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";

// this code will be run on the node
const litActionCode = `
const signEcdsa = async () => {
  // this Lit Action simply requests an ECDSA signature share from the Lit Node
  const resp = await Lit.Actions.call({
    ipfsId: "QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm",
    params: {
      // this is the string "Hello World" for testing
      toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
      publicKey:
        "0x02e5896d70c1bc4b4844458748fe0f936c7919d7968341e391fb6d82c258192e64",
      sigName: "childSig",
    },
  });

  console.log("results: ", resp);
};

if (functionToRun === "signEcdsa") {
  signEcdsa();
}
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
        alertWhenUnauthorized: false,
        litNetwork: "serrano",
        debug: true,
    });
    await litNodeClient.connect();
    const results = await litNodeClient.executeJs({
        code: litActionCode,
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
            functionToRun: "signEcdsa",
        },
    });
    console.log("results: ", results);
};

runLitAction();