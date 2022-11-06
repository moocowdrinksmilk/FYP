import axios from "axios"
import { NextApiResponse } from "next"

type Req = {
    method: string,
    body: {
        mintAddress: string,
        publicKey: string,
        collectionId: string
    },
    headers: {
        authorization: string
    }
}

const handler = async (req: Req, res: NextApiResponse) => {
    try {
        console.log(req.body);
        
        const buy = await axios.post<{success: boolean, transaction: string[]}>(`https://b6pti03253.execute-api.ap-southeast-1.amazonaws.com/dev/marketplace/list`, {
            mintAddress: req.body.mintAddress,
            price: 0.01,
            publicKey: req.body.publicKey,
            collectionId: req.body.collectionId
        })
        res.status(200).send(buy.data)

    } catch(e) {
        console.log(e.message);
        res.status(400).send("Bad Request")
    }
}
export default handler