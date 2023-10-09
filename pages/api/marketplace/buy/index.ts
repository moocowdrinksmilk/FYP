import axios from "axios"
import { NextApiResponse } from "next"

type Req = {
    method: string,
    body: {
        mintAddress: string,
        publicKey: string
    },
    headers: {
        authorization: string
    }
}

const handler = async (req: Req, res: NextApiResponse) => {
    console.log(req.body);
    try {
        const buy = await axios.post<{success: boolean, transaction: string[]}>(`https://b6pti03253.execute-api.ap-southeast-1.amazonaws.com/dev/marketplace/buy`, {
            mintAddress: req.body.mintAddress,
            publicKey: req.body.publicKey
        })
        res.status(200).send(buy.data)

    } catch(e: any) {
        console.log(e.message);
        res.status(400).send("Bad Request")
    }
}

export default handler