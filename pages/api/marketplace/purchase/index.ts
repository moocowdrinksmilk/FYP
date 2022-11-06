import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

type PurchaseRequest = {
    method: string,
    body: {
        listingPrice: number
        listedMint: string
        buyer: string
        seller: string
    }
}
const handler = async (req: PurchaseRequest, res: NextApiResponse) => {
    const baseUrl = "marketplace-alb-prod-2113570642.ap-southeast-1.elb.amazonaws.com"
    const resp = await axios.post(`${baseUrl}/purchase`, req.body)
    res.status(200).send({transaction: resp.data.transaction})
}

export default handler