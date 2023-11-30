import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair } from "@solana/web3.js";
import { decode } from "bs58";
import { NextApiRequest, NextApiResponse } from "next";

interface Req {
    body: {
        name: string,
        date: string,
        venue: string,
        description: string,
        image: string,
        maxSeats: number,
    },
    method: string;
}

const handler = async (req: Req, res: NextApiResponse) => {
    const { body, method } = req;
    switch (method) {
        case "POST":
            try {
                const { name, date, venue, description, image, maxSeats } = body;
                const metadata = {
                    name,
                    date,
                    venue,
                    description,
                    image,
                    maxSeats,
                };

                const connection = new Connection('https://api.devnet.solana.com');
                const escrowSecretKey = process.env.ESCROW_SECRET_KEY as string
                const escrowSigner = Keypair.fromSecretKey(decode(escrowSecretKey))

                const metaplex = Metaplex.make(connection)
                    .use(keypairIdentity(escrowSigner))
                    .use(bundlrStorage({
                        address: 'https://devnet.bundlr.network',
                        providerUrl: 'https://api.devnet.solana.com',
                        timeout: 60000,
                    }));

                const { uri } = await metaplex
                    .nfts()
                    .uploadMetadata(metadata);

                res.status(200).json({ uri });
            } catch (error) {
                res.status(500).json({ error });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

export default handler;