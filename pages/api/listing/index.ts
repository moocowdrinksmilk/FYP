import { Metadata } from "@metaplex-foundation/js"
import { listed } from "@prisma/client"
import { NextApiResponse } from "next"
import { ListingRepository } from "../../../prisma/listing"
import { PublicKey } from "@solana/web3.js";
import { MetaplexRpc } from "../../../solana/metaplex";

type Req = {
    method: string,
    query: {
        collection_id: string
    },
    headers: {
        authorization: string
    }
}

export interface ListingRes extends listed {
    metadata: Metadata
}

const handler = async (req: Req, res: NextApiResponse) => {
    if (req.method == "GET") {
        let listings: listed[] = []
        listings = await ListingRepository.getListingsByCollectionId(req.query.collection_id)

        let keys: PublicKey[] = []
        for (let listing of listings) {
            keys.push(new PublicKey(listing.publicKey))
        }
        let metadatas = await MetaplexRpc.getNftsFromMints(keys, 0)
        
        let metadataObj: {[mint: string]: Metadata} = {}
        for (let meta of metadatas) {
            if (meta)
            metadataObj[meta.mintAddress.toBase58()] = meta
        }
        let resListing:ListingRes[] = []
        for (let i = 0; i< listings.length; i++) {
            if (listings[i].publicKey in metadataObj) {
                resListing.push({
                    ...listings[i],
                    metadata: metadataObj[listings[i].publicKey]
                })
            } else {
                resListing.push({
                    ...listings[i],
                    // @ts-ignore
                    metadata: {}
                })
            }
            
        }


        res.status(200).send(resListing)
    } else {
        res.status(405).send({message: "This method is not allowed"})
    }
}

export default handler