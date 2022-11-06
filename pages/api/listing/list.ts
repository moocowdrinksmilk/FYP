import { NextApiResponse } from "next"

type Req = {
    method: string,
    query: {
        collection_id: string
    },
    headers: {
        authorization: string
    }
}

const handler = async (req: Req, res: NextApiResponse) => {
    
}

export default handler