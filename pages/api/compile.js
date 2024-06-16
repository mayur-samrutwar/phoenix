import { Soroban } from "@stellar/stellar-sdk";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { code } = req.body;

    try {
      // Configure Soroban instance (replace with your Soroban network details)
      const soroban = new Soroban("https://soroban-testnet.stellar.org");

      // Compile the code
      const compiled = await soroban.compile(code);

      res.status(200).json(compiled);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Compilation failed" });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
