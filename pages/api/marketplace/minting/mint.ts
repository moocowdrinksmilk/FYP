import axios from "axios"
import { NextApiResponse } from "next"

type Req = {
    method: string,
    body: {
        collectionAddr: string,
        publicKey: string,
        signature: string
    },
    headers: {
        authorization: string
    }
}

const handler = async (req: Req, res: NextApiResponse) => {
    console.log(req.body);
    try {
        const nonce = await axios.post(`https://b6pti03253.execute-api.ap-southeast-1.amazonaws.com/dev/mint`, {
            publicKey: req.body.publicKey,
            collectionAddr: req.body.collectionAddr,
            signature: req.body.signature,
            
        })
        console.log(nonce.data);
        
        res.status(200).send(nonce.data)
    } catch(e) {
        console.log(e);
        res.status(400).send({message: e.message})
    }

}

export default handler