import { Metadata, Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

const conn = new Connection("https://magical-light-sheet.solana-mainnet.quiknode.pro/96f2fb37a3247ee895fd0d36694966e86f6448d9/")

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
