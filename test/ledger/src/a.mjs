import Transport from "@ledgerhq/hw-transport-node-hid";
// import Transport from "@ledgerhq/hw-transport-u2f"; // for browser
import AppBtc from "@ledgerhq/hw-app-btc";
const getBtcAddress = async () => {
 console.log(Transport);
  //const transport = await Transport.create();
  //const btc = new AppBtc(transport);
  //const result = await btc.getWalletPublicKey("44'/0'/0'/0/0");
  //return result.bitcoinAddress;
};
getBtcAddress().then(a => console.log(a));
