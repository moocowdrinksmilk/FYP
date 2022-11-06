import axios from "axios"
import { NextApiResponse } from "next"

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
    const nonce = await axios.get(`https://b6pti03253.execute-api.ap-southeast-1.amazonaws.com/dev/mint/${req.query.pubkey}/nonce`)
    res.status(200).send({nonce: nonce.data.nonce})
}

export default handler