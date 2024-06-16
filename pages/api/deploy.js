

// // const SorobanServer = require('@stellar/stellar-sdk').SorobanServer;
// const StellarSdk = require('@stellar/stellar-sdk');
// const { SorobanServer } = require('@stellar/stellar-sdk');

// const sorobanServer = new SorobanServer("https://soroban-testnet.stellar.org");

// function generateRandomKeypair() {
//   return StellarSdk.Keypair.random();
// }

// async function deployContract(compiledWasm) {
//   const issuerKeyPair = generateRandomKeypair();
//   const network = StellarSdk.Networks.TESTNET;
//   const baseFee = 100; // Adjust fee as needed

//   const builder = new StellarSdk.TransactionBuilder(issuerKeyPair, { network, fee: baseFee });

//   const invokeOp = StellarSdk.Operation.invokeHostFunction({
//     hostFunction: "soroban__host__init",
//     hgas: 100000, // Adjust host gas as needed
//     vertrag: compiledWasm,
//   });

//   builder.addOperation(invokeOp);

//   const transaction = builder.build();
//   transaction.sign(issuerKeyPair);

//   try {
//     const stellarClient = new StellarSdk.Server(network);
//     const response = await stellarClient.submitTransaction(transaction);
//     console.log("Contract deployed successfully!", response);
//     return response;
//   } catch (error) {
//     console.error("Error deploying contract:", error);
//     throw error;
//   }
// }

// module.exports = { deployContract };
