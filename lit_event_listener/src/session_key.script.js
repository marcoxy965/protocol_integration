// this example will generate and sign a session key and use it for a request

import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";
import { Wallet } from "@ethersproject/wallet";
import { computeAddress } from "@ethersproject/transactions";
import { SiweMessage } from "siwe";

// this code will be run on the node
const litActionCode = `
const go = async () => {
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the response from the node
  // and combined into a full signature by the LitJsSdk for you to use on the client
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
};

go();
`;

// Need more details on if this is live or not
const runLitAction = async () => {
  // mock a wallet
  const wallet = new Wallet(process.env.LIT_MUMBAI_DEPLOYER_PRIVATE_KEY);

  const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
    alertWhenUnauthorized: false,
    litNetwork: "localhost",
    debug: true,
  });
  await litNodeClient.connect();

  // when the getSessionSigs function is called, it will generate a session key and sign it
  // using this function. the session key will be used for all requests until the session expires
  let authNeededCallback = async ({ chain, resources, expiration, uri }) => {
    const domain = "localhost:3000";
    const message = new SiweMessage({
      domain,
      address: wallet.address,
      statement: "Sign a session key to use with Lit Protocol",
      uri,
      version: "1",
      chainId: "1",
      expirationTime: expiration,
      resources,
    });
    const toSign = message.prepareMessage();
    const signature = await wallet.signMessage(toSign);

    const authSig = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: toSign,
      address: wallet.address,
    };

    return authSig;
  };

  let sessionSigs = await litNodeClient.getSessionSigs({
    resources: ["litAction://*"],
    chain: "ethereum",
    authNeededCallback,
  });

  // console.log("got sessionSigs: ", sessionSigs);

  const results = await litNodeClient.executeJs({
    code: litActionCode,
    sessionSigs,
    // all jsParams can be used anywhere in your litActionCode
    jsParams: {
      // this is the string "Hello World" for testing
      toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
      publicKey:
        "0x044f9cbd78601c7ef5e4f95f43ddd3ad100782f2a5bec51032128af4a226f82b57342bea3371be09d3f88c7b26d954cf38e9bfca41d4399038d77174f6e809e07f",
      sigName: "sig1",
    },
  });
  console.log("results: ", results);
};

runLitAction();
