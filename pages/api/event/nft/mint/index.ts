import { NextApiResponse } from "next"
import SolanaUtil, { CreateCollectionEvent } from "../../../../../utils/solana"
import { v4 } from "uuid"
import { EventRepository } from "../../../../../prisma/event"
import { PublicKey } from "@solana/web3.js"

interface Req {
    body: {
        name: string,
        symbol: string,
        description: string,
        image: string,
        venue: string,
        date: string,
        organiserShare: number,
        organiserAddress: string,
        eventId: string,
        seat: string,
    }
}

const handler = async (req: Req, res: NextApiResponse) => {
    try {
        const event = await EventRepository.getEventById(req.body.eventId)
        const nftTicket: CreateCollectionEvent = {
            collectionDetails: {
                collectionName: req.body.name,
                collectionSymbol: req.body.symbol,
                collectionDescription: req.body.description,
                collectionImage: req.body.image,
                collectionRoyalties: 10,
                attributes: [
                    {
                        trait_type: "Venue",
                        value:  req.body.venue
                    },
                    {
                        trait_type: "Date",
                        value: req.body.date
                    },
                    {
                        trait_type: "id",
                        value: event.id
                    },
                    {
                        trait_type: "seat",
                        value: req.body.seat
                    }
                ],
                creators: [
                    {
                        // Minter Linter's address
                        creatorAddress: "2gizQhgjQGJFqkBAN7YToHQd9VY9xGSH1s6cNSu4e1s2",
                        share: 100 - req.body.organiserShare
                    }, 
                    {
                        // Organisor's address
                        creatorAddress: req.body.organiserAddress,
                        share: req.body.organiserShare
                    }
                ]
            }
        }
        const collection = await SolanaUtil.createCollection(nftTicket)

        const mint = collection.mint.address
        const tokenAccount = collection.token.address
        const freezeAuthority = collection.mint.freezeAuthorityAddress
        await SolanaUtil.freeze(tokenAccount, mint, freezeAuthority as PublicKey)

        return res.status(200).send(collection)
    }
    catch(e: any) {
        console.log(e);
        res.status(400).send({message: e.message})
    }
}

export default handler
