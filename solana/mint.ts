import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fetchCandyGuard, fetchCandyMachine, mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine'
import { publicKey, generateSigner, percentAmount, PublicKey, KeypairSigner, some } from '@metaplex-foundation/umi'
import { create } from '@metaplex-foundation/mpl-candy-machine'
import {
    TokenStandard,
    createNft,
} from '@metaplex-foundation/mpl-token-metadata'



// Use the RPC endpoint of your choice.
const umi = createUmi('https://api.devnet.solana.com').use(mplCandyMachine())

export class MetaplexMint {
    private readonly umi = umi

    getCreateCollectionNftInstructions(authority: KeypairSigner, collectionMint: PublicKey, name: string, uri: string) {
        const createCollectionNftInstructions = createNft(umi, {
            mint: collectionMint,
            authority: authority,
            name: name,
            uri: uri,
            sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
            isCollection: true,
        }).getInstructions()

        return createCollectionNftInstructions
    }

    async getCreateCandyMachineInstructions(collectionMint: PublicKey, authority: KeypairSigner) {
        const candyMachine = generateSigner(umi)
        const transactionBuilder = await create(umi, {
            candyMachine,
            collectionMint: collectionMint,
            collectionUpdateAuthority: authority,
            tokenStandard: TokenStandard.NonFungible,
            sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
            itemsAvailable: 5000,
            creators: [
                {
                    address: umi.identity.publicKey,
                    verified: true,
                    percentageShare: 100,
                },
            ],
            configLineSettings: some({
                prefixName: '',
                nameLength: 32,
                prefixUri: '',
                uriLength: 200,
                isSequential: false,
            }),
        })

        return transactionBuilder.getInstructions()
    }

}