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
            toSign: "hello world",
            publicKey:
                "0x0443ccdc0178d2be400f45d3c69c96e6bbd6fb4b52f74408c0801db3a2c420db3f17eaa5e4ec44c625874a3a63ba738c6b1434c9c81e902644b025721bfbf922a9",
            sigName: "sig1",
        },
    });
    console.log("signatures: ", signatures);
};

runLitAction();