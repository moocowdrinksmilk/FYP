import { NextApiResponse } from "next"
import SolanaUtil, { CreateCollectionEvent } from "../../../../../utils/solana"
import { v4 } from "uuid"
import { EventRepository } from "../../../../../prisma/event"
import { PublicKey } from "@solana/web3.js"

interface Req {
    body: {
        eventId: string,
    }
}

export const maxDuration = 300;

const handler = async (req: Req, res: NextApiResponse) => {
    try {
        const event = await EventRepository.getEventById(req.body.eventId)
        const nftTicket: CreateCollectionEvent = {
            collectionDetails: {
                collectionName: event.name,
                collectionSymbol: "UNS",
                collectionDescription: event.description,
                collectionImage: event.image,
                collectionRoyalties: 10,
                attributes: [
                    {
                        trait_type: "Venue",
                        value:  event.venue
                    },
                    {
                        trait_type: "Date",
                        value: event.date.toString()
                    },
                    {
                        trait_type: "id",
                        value: event.id
                    },
                    {
                        trait_type: "seat",
                        value: "1A"
                    }
                ],
                creators: [
                    {
                        // Minter Linter's address
                        creatorAddress: "2gizQhgjQGJFqkBAN7YToHQd9VY9xGSH1s6cNSu4e1s2",
                        share: 100 - 10
                    }, 
                    {
                        // Organisor's address
                        creatorAddress: "6JN6r9uoijfxtgdxcyCkXrqpzt8Gqy3E68EcUF4DqWNs",
                        share: 10
                    }
                ]
            }
        }
        const collection = await SolanaUtil.createCollection(nftTicket)

        const mint = collection.mint.address
        const tokenAccount = collection.token.address
        const freezeAuthority = collection.mint.freezeAuthorityAddress
        await SolanaUtil.freeze(tokenAccount, mint, freezeAuthority as PublicKey)

        return res.status(200).send({
            mint: mint.toBase58(),
        })
    }
    catch(e: any) {
        console.log(e);
        res.status(400).send({message: e.message})
    }
}

export default handler
