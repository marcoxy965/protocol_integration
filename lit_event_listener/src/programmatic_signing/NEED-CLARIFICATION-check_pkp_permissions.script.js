import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";

import { fromString as uint8arrayFromString } from "uint8arrays/from-string";
import ethers from "ethers";
import siwe from "siwe";

// clarify - seems like ipfs hash expired / unpinned

const runLitAction = async () => {

  // Programmatically generate an AuthSig
  const privKey =
  "______your private key________";
  const privKeyBuffer = uint8arrayFromString(privKey, "base16");
  const wallet = new ethers.Wallet(privKeyBuffer);

  const domain = "localhost";
  const origin = "https://localhost/login";
  const statement =
    "This is a test statement.  You can put anything you want here.";

  const siweMessage = new siwe.SiweMessage({
    domain,
    address: wallet.address,
    statement,
    uri: origin,
    version: "1",
    chainId: "1",
  });

  const messageToSign = siweMessage.prepareMessage();

  const signature = await wallet.signMessage(messageToSign);

  console.log("signature", signature);

  const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);

  const authSig = {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: recoveredAddress,
  };


  // Need more info on IPFS etc --> clarify
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

    const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
        alertWhenUnauthorized: false,
        litNetwork: "custom",
        debug: true,
        minNodeCount: 2,
        // bootstrapUrls: [
        //     "http://localhost:7470",
        //     "http://localhost:7471",
        //     "http://localhost:7472",
        // ],
    });
    await litNodeClient.connect();
    const results = await litNodeClient.executeJs({
        code: litActionCode,
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
            publicKey:
                "0x0443ccdc0178d2be400f45d3c69c96e6bbd6fb4b52f74408c0801db3a2c420db3f17eaa5e4ec44c625874a3a63ba738c6b1434c9c81e902644b025721bfbf922a9",
        },
    });
    console.log("results: ", results);
};

runLitAction();
