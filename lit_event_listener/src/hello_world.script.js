import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";

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

// you need an AuthSig to auth with the nodes
// normally you would obtain an AuthSig by calling LitJsSdk.checkAndSignAuthMessage({chain})
const authSig = {
  sig: "0x0e50e370ba45b391c65f3739618c652c121c0e88cd6b99202815bdf29b247f970a92cd74f269792695e87e4a8313884ea019a0cc177eb7e8519b267190a22b061b",
  derivedVia: "web3.eth.personal.sign",
  signedMessage:
  "localhost:1210 wants you to sign in with your Ethereum account:\n0xeE52f6E8F8F075Bb6119958c1ACeB16C788e57d6\n\n\nURI: http://localhost:1210/auth\nVersion: 1\nChain ID: 1\nNonce: GJmYcbyssnunj5unD\nIssued At: 2023-04-18T06:01:02.599Z\nExpiration Time: 2023-04-19T06:01:02.586Z",
  address: "0xee52f6e8f8f075bb6119958c1aceb16c788e57d6",
};

const runLitAction = async () => {
  const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
    litNetwork: "serrano",
  });
  
  await litNodeClient.connect();
  const signatures = await litNodeClient.executeJs({
    code: litActionCode,
    authSig,
    // all jsParams can be used anywhere in your litActionCode
    jsParams: {
      // this is the string "Hello World" for testing
      toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
      publicKey:
        "0x044f9cbd78601c7ef5e4f95f43ddd3ad100782f2a5bec51032128af4a226f82b57342bea3371be09d3f88c7b26d954cf38e9bfca41d4399038d77174f6e809e07f",
      sigName: "sig1",
    },
  });
  console.log("signatures: ", signatures);
};

runLitAction();