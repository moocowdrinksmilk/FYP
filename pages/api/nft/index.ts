import { PublicKey } from "@solana/web3.js"
import { NextApiResponse } from "next"
import { getAllNFTs } from "../../../solana/metaplex"

type Req = {
    method: string,
    query: {
        pubkey: string
    },
    headers: {
        authorization: string
    }
}

const handler = async (req: Req, res: NextApiResponse) => {
    const nfts = await getAllNFTs(new PublicKey(req.query.pubkey), 0)
    res.status(200).send({nfts: nfts})
}

export default handler