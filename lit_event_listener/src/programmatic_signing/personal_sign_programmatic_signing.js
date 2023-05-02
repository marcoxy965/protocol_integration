import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";
import ethers from "ethers";
import siwe from "siwe";

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
// this requests a signature share from the Lit Node
// the signature share will be automatically returned in the HTTP response from the node
// all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
const sigShare = await Lit.Actions.signEcdsa({ toSign, publicKey , sigName });
};

go();
`;


  const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
    litNetwork: "serrano",
  });

  // converting message to ascii array
  const stringToConvert = "Hello World";
  const asciiArray = Buffer.from(stringToConvert).toJSON().data;
  console.log(asciiArray);

  await litNodeClient.connect();
  const signatures = await litNodeClient.executeJs({
    code: litActionCode,
    authSig,
    // all jsParams can be used anywhere in your litActionCode
    jsParams: {
      // this is the string "Hello World" for testing
      toSign: "hello world",
      publicKey:
        "0x0443ccdc0178d2be400f45d3c69c96e6bbd6fb4b52f74408c0801db3a2c420db3f17eaa5e4ec44c625874a3a63ba738c6b1434c9c81e902644b025721bfbf922a9",
      sigName: "sig1",
    },
  });
  console.log("signatures: ", signatures);
};

runLitAction();