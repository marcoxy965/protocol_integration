import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";

// Need more info on IPFS etc
// this code will be run on the node
const litActionCode = `
const go = async () => {
  const results = {}
  const tokenId = Lit.Actions.pubkeyToTokenId({publicKey})
  results.tokenId = tokenId

  // let's lookup some permissions
  const isPermittedAction = await Lit.Actions.isPermittedAction({tokenId, ipfsId: "QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm"})
  results.isPermittedAction = isPermittedAction

  const isPermittedAddress = await Lit.Actions.isPermittedAddress({tokenId, address: Lit.Auth.authSigAddress})
  results.isPermittedAddress = isPermittedAddress

  const userId = uint8arrayFromString("testing", "utf8")
  const isPermittedAuthMethod = await Lit.Actions.isPermittedAuthMethod({tokenId, authMethodType: "2", userId })
  results.isPermittedAuthMethod = isPermittedAuthMethod

  const permittedActions = await Lit.Actions.getPermittedActions({tokenId})
  results.permittedActions = permittedActions

  const permittedAddresses = await Lit.Actions.getPermittedAddresses({tokenId})
  results.permittedAddresses = permittedAddresses

  const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({tokenId})
  results.permittedAuthMethods = JSON.stringify(permittedAuthMethods)

  const permittedAuthMethodScopes = await Lit.Actions.getPermittedAuthMethodScopes({
    tokenId,
    authMethodType: "2",
    userId,
    maxScopeId: 10
  })

  results.permittedAuthMethodScopes = JSON.stringify(permittedAuthMethodScopes)

  Lit.Actions.setResponse({response: JSON.stringify(results)})
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
        alertWhenUnauthorized: false,
        litNetwork: "custom",
        debug: true,
        minNodeCount: 2,
        bootstrapUrls: [
            "http://localhost:7470",
            "http://localhost:7471",
            "http://localhost:7472",
        ],
    });
    await litNodeClient.connect();
    const results = await litNodeClient.executeJs({
        code: litActionCode,
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
            publicKey:
                "0x044f9cbd78601c7ef5e4f95f43ddd3ad100782f2a5bec51032128af4a226f82b57342bea3371be09d3f88c7b26d954cf38e9bfca41d4399038d77174f6e809e07f",
        },
    });
    console.log("results: ", results);
};

runLitAction();
