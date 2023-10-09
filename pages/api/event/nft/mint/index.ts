import { NextApiResponse } from "next"
import SolanaUtil, { CreateCollectionEvent } from "../../../../../utils/solana"
import { v4 } from "uuid"

interface Req {
    body: {
        name: string,
        symbol: string,
        description: string,
        image: string,
        venue: string,
        date: string,
        organiserShare: number,
        organiserAddress: string
    }
}

const handler = async (req: Req, res: NextApiResponse) => {
    try {
        const eventId = v4()
        const event: CreateCollectionEvent = {
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
                        value: eventId
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
        const collection = await SolanaUtil.createCollection(event)

        return res.status(200).send(collection)
    }
    catch(e: any) {
        console.log(e);
        res.status(400).send({message: e.message})
    }
}

export default handler
