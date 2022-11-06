import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

type MintRequest = {
    method: string,
    body: {
        mintPrice: number,
        ticketDetails: {
            collectionAddress: string,
            ticketName: string,
            ticketSymbol: string,
            ticketDescription: string,
            ticketImage: string,
            ticketRoyalties: 800,
            attributes: { trait_type: string, value: string }[] | undefined
            creators: { creatorAddress: string; share: number; }[],
        }
        minter: string
    }
}
const handler = async (req: MintRequest, res: NextApiResponse) => {
    const baseUrl = "marketplace-alb-prod-2113570642.ap-southeast-1.elb.amazonaws.com"
    const resp = await axios.post(`${baseUrl}/mint`, req.body)
    res.status(200).send({ transaction: resp.data.transaction })
}

export default handler