import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";
import fs from "fs";
import { serialize, recoverAddress } from "@ethersproject/transactions";
import {
  hexlify,
  splitSignature,
  hexZeroPad,
  joinSignature,
} from "@ethersproject/bytes";
import { recoverPublicKey, computePublicKey } from "@ethersproject/signing-key";
import { verifyMessage } from "@ethersproject/wallet";
import { fromString as uint8arrayFromString } from "uint8arrays/from-string";
import ethers from "ethers";
import siwe from "siwe";


const go = async () => {

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
  const sigShare = await LitActions.ethPersonalSignMessageEcdsa({ message, publicKey , sigName });
};

go();
`;

  const message = "Hello World";
  const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
    litNetwork: "custom",
    bootstrapUrls: [
      "http://localhost:7470",
      "http://localhost:7471",
      "http://localhost:7472",
      "http://localhost:7473",
      "http://localhost:7474",
      "http://localhost:7475",
      "http://localhost:7476",
      "http://localhost:7477",
      "http://localhost:7478",
      "http://localhost:7479",
    ],
  });
  await litNodeClient.connect();
  const signatures = await litNodeClient.executeJs({
    code: litActionCode,
    jsParams: {
      // this is the string "Hello World" for testing
      message,
      publicKey:
        "0x0443ccdc0178d2be400f45d3c69c96e6bbd6fb4b52f74408c0801db3a2c420db3f17eaa5e4ec44c625874a3a63ba738c6b1434c9c81e902644b025721bfbf922a9",
      sigName: "sig1",
    },
    authSig,
  });
  console.log("signatures: ", signatures);
  const sig = signatures.sig1;
  const dataSigned = "0x" + sig.dataSigned;
  const encodedSig = joinSignature({
    r: "0x" + sig.r,
    s: "0x" + sig.s,
    v: sig.recid,
  });

  console.log("encodedSig", encodedSig);
  console.log("sig length in bytes: ", encodedSig.substring(2).length / 2);
  console.log("dataSigned", dataSigned);
  const splitSig = splitSignature(encodedSig);
  console.log("splitSig", splitSig);

  const recoveredPubkey = recoverPublicKey(dataSigned, encodedSig);
  console.log("uncompressed recoveredPubkey", recoveredPubkey);
  const compressedRecoveredPubkey = computePublicKey(recoveredPubkey, true);
  console.log("compressed recoveredPubkey", compressedRecoveredPubkey);
  const recoveredAddress2 = recoverAddress(dataSigned, encodedSig);
  console.log("recoveredAddress", recoveredAddress2);

  const recoveredAddressViaMessage = verifyMessage(message, encodedSig);
  console.log("recoveredAddressViaMessage", recoveredAddressViaMessage);
};

go();