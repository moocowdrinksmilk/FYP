import { NextApiResponse } from "next"
import { EventWhitelistRepository } from "../../../../prisma/eventWhitelist"


interface Req {
    body: {
        
    },
    query: {
        id: string,
        address: string,
    },
    method: string,
}

const handler = async (req: Req, res: NextApiResponse) => {
    const method = req.method
    switch(method) {
        case "GET":
            try {
                const whitelist = await EventWhitelistRepository.isWhiteListed(req.query.id, req.query.address)
                return res.status(200).send(whitelist)
            } catch(e: any) {
                return res.status(400).send({message: e.message})
            }
    }
}

export default handler