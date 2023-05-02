import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";
import ethers from "ethers";
import siwe from "siwe";

// template - pkp public-key, litActionCode, any additional param, like toSign-message

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

  const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
    litNetwork: "serrano",
  });
  await litNodeClient.connect();
  const signatures = await litNodeClient.executeJs({
    code: litActionCode,
    authSig,
    jsParams: {
      toSign: "hello world",
      publicKey:
        "0x0443ccdc0178d2be400f45d3c69c96e6bbd6fb4b52f74408c0801db3a2c420db3f17eaa5e4ec44c625874a3a63ba738c6b1434c9c81e902644b025721bfbf922a9",
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
            comparator: "<",
            value: "1",
          },
        },
      ],
      authSig: authSig,
      chain: "ethereum",
    },
  });
  console.log("signatures: ", signatures);
};

runLitAction();