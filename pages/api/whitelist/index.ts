import { NextApiResponse } from "next";
import { WhitelistRepository } from "../../../prisma/whitelist";
import { EventWhitelistRepository } from "../../../prisma/eventWhitelist";

interface Req {
    body: {
        wallets: string[],
        eventId: string,
    },
    method: string;
}

const handler = async (req: Req, res: NextApiResponse) => {
    const { body, method } = req;
    switch (method) {
        case "POST":
            try {
                const { wallets } = body;
                const whitelists = await EventWhitelistRepository.addWhitelists(body.eventId, wallets);

                res.status(200).json(whitelists);
            } catch (error) {
                res.status(500).json({ error });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

export default handler;