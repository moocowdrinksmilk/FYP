import { Metadata, Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

const conn = new Connection("https://solana-mainnet.g.alchemy.com/v2/ogX-h080ThMql5r1743yysjMm111hRDS")

const metaplex = new Metaplex(conn)

export const getNftsFromMints = async (mints: PublicKey[], tryCount: number) => {
    try {
        const nfts = await metaplex.nfts().findAllByMintList({mints})
        return nfts as Metadata[]
    } catch(e) {
        throw e
    }
}

export const getAllNFTs = async (pubkey: PublicKey, tryCount: number) => {
    while (true) {
        try {
            const nfts = await metaplex.nfts().findAllByOwner({owner: pubkey})
            return nfts as Metadata[]
         } catch (e) {
            continue
        }
    }

}

export const MetaplexRpc = {
    getNftsFromMints
}
