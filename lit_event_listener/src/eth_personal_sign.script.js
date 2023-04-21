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

const go = async () => {
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
        "0x044f9cbd78601c7ef5e4f95f43ddd3ad100782f2a5bec51032128af4a226f82b57342bea3371be09d3f88c7b26d954cf38e9bfca41d4399038d77174f6e809e07f",
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
  const recoveredAddress = recoverAddress(dataSigned, encodedSig);
  console.log("recoveredAddress", recoveredAddress);

  const recoveredAddressViaMessage = verifyMessage(message, encodedSig);
  console.log("recoveredAddressViaMessage", recoveredAddressViaMessage);
};

go();