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
  const litActionCode = fs.readFileSync("./signTxnTest.js");

  const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
    alertWhenUnauthorized: false,
    minNodeCount: 6,
    debug: true,
    litNetwork: "serrano",
  });
  await litNodeClient.connect();
  const results = await litNodeClient.executeJs({
    code: litActionCode,
    authSig,
    jsParams: {},
  });
  console.log("results", results);
  const { signatures, response } = results;
  console.log("response", response);
  const sig = signatures.sig1;
  const { dataSigned } = sig;
  const encodedSig = joinSignature({
    r: "0x" + sig.r,
    s: "0x" + sig.s,
    v: sig.recid,
  });

  const { txParams } = response;

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

  // const txParams = {
  //   nonce: "0x0",
  //   gasPrice: "0x2e90edd000", // 200 gwei
  //   gasLimit: "0x" + (30000).toString(16), // 30k gas limit should be enough.  only need 21k to send.
  //   to: "0x50e2dac5e78B5905CB09495547452cEE64426db2",
  //   value: "0x" + (10000).toString(16),
  //   chainId,
  // };

  const txn = serialize(txParams, encodedSig);

  console.log("txn", txn);
};

go();
