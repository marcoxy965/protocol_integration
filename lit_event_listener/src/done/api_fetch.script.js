import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";

/**
 * Some interesting parameters in the old sdk - alertWhenUnauthorized, debug
 * const litNodeClient = new LitJsSdk.LitNodeClient({
    alertWhenUnauthorized: false,
    litNetwork: "serrano",
    debug: true,
  });
 */

// this code will be run on the node
const litActionCode = `
const go = async () => {  
  const url = "https://api.weather.gov/gridpoints/TOP/31,80/forecast";
  const resp = await fetch(url).then((response) => response.json());
  const temp = resp.properties.periods[0].temperature;

  // only sign if the temperature is above 60.  if it's below 60, exit.
  if (temp >= 60) {
    return;
  }
  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey , sigName });
};

go();
`;

// you need an AuthSig to auth with the nodes
// normally you would obtain an AuthSig by calling LitJsSdk.checkAndSignAuthMessage({chain})
const authSig = {
    sig: '0xdaed0e0d3a822a89173e95b717d70ec79889f3e36ce503c015874099cb0f62a8189403973b1e292d35a0e1745a40862b92b4e21b3fee979d7e9b5881a71ecf081c',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: 'localhost wants you to sign in with your Ethereum account:\n' +
      '0xb60D78D1ff955b90FA92056621e911040F1E397a\n' +
      '\n' +
      'This is a test statement.  You can put anything you want here.\n' +
      '\n' +
      'URI: https://localhost/login\n' +
      'Version: 1\n' +
      'Chain ID: 1\n' +
      'Nonce: NQUivWD6giyIR6Nds\n' +
      'Issued At: 2023-05-02T08:33:57.218Z',
    address: '0xb60D78D1ff955b90FA92056621e911040F1E397a'
  };

const runLitAction = async () => {
    const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
        litNetwork: "serrano",
    });
    await litNodeClient.connect();
    const signatures = await litNodeClient.executeJs({
        targetNodeRange: 1,
        code: litActionCode,
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
            // this is the string "Hello World" for testing
            toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
            publicKey:
                "0x0443ccdc0178d2be400f45d3c69c96e6bbd6fb4b52f74408c0801db3a2c420db3f17eaa5e4ec44c625874a3a63ba738c6b1434c9c81e902644b025721bfbf922a9",
            sigName: "sig1",
        },
    });
    console.log("signatures: ", signatures);
};

runLitAction();