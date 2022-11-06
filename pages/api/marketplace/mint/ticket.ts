import { NextApiResponse } from "next"
import { WhitelistRepository } from "../../../../prisma/whitelist"

type Req = {
    method: string,
    query: {
        key: string
    },
    headers: {
        authorization: string
    }
}

const handler = async (req: Req, res: NextApiResponse) => {
    const list = await WhitelistRepository.getWhitelists(req.query.key)
    res.status(200).send({list: list})
}

export default handler