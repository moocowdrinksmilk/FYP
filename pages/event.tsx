import { Event } from "@prisma/client"
import axios from "axios"
import { useMemo, useState } from "react"
import { DateTime } from "luxon"
import { useRouter } from "next/router"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAnchorWallet } from "@solana/wallet-adapter-react"
import { Commitment, Connection, PublicKey } from "@solana/web3.js"
import { S3Client } from "@aws-sdk/client-s3"
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { awsUploader } from '@metaplex-foundation/umi-uploader-aws';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { TokenStandard, createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata"
import { generateSigner, percentAmount, publicKey, sol, some, transactionBuilder } from "@metaplex-foundation/umi"
import { setComputeUnitLimit, fetchMint } from "@metaplex-foundation/mpl-toolbox";
import { addConfigLines, create, createCandyMachineV2, fetchCandyMachine, mintV2, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { getNftsFromMints } from "../solana/metaplex"
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes"



const Page = () => {
    const router = useRouter()
    const wallet = useAnchorWallet()

    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [venue, setVenue] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [maxSeats, setMaxSeats] = useState(0)

    const [event, setEvent] = useState<Event | null>(null)

    const rpcEndpoint = "https://api.devnet.solana.com"
    const bucketName = "usememo-public";

    const connection = new Connection(rpcEndpoint, "confirmed")
    const metaplex = Metaplex.make(connection).use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
    }));

    const s3 = useMemo(() => new S3Client({
        region: process.env.NEXT_PUBLIC_AWS_REGION,
        credentials: {
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
        }
    }), []);
    const umi = useMemo(() =>
        createUmi("https://api.devnet.solana.com")
            .use(awsUploader(s3, bucketName))
            .use(walletAdapterIdentity(wallet!, true))
            .use(mplTokenMetadata())
            .use(mplCandyMachine()),
        [rpcEndpoint, wallet, bucketName, s3]);

    const createEvent = async () => {
        const jsDate = DateTime.fromFormat(date, "yyyy-LL-dd").toJSDate()
        try {

            const res = await axios.post<Event>("/api/event", {
                name,
                date: jsDate,
                venue,
                description,
                image: imageUrl,
                maxSeats
            })

            router.push(`/event/${res.data.id}`)
        } catch (e) {
            console.log(e)
        }
    }

    const createCollection = async () => {
        try {
            const collectionUpdateAuthority = generateSigner(umi);
            const collectionMint = generateSigner(umi);

            const body = {
                name: name,
                date: date,
                venue: venue,
                description: description,
                image: imageUrl,
                maxSeats: maxSeats,
            }

            const uriRes = await axios.post<{ uri: string }>("/api/metadata/upload", body)

            console.log(uriRes.data.uri, "JSON URI");

            let createCollectionNft = await createNft(umi, {
                mint: collectionMint,
                authority: collectionUpdateAuthority,
                name: name,
                uri: uriRes.data.uri,
                sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
                isCollection: true,
            }).sendAndConfirm(umi)

            const signature = createCollectionNft.signature
            const sigString = bs58.encode(signature)

            await confirmSignature(sigString, "finalized")

            const candyMachine = generateSigner(umi);
            let createNftInstructionBuilder = await create(umi, {
                candyMachine,
                collectionMint: collectionMint.publicKey,
                collectionUpdateAuthority,
                tokenStandard: TokenStandard.NonFungible,
                sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
                itemsAvailable: maxSeats,
                creators: [
                    {
                        address: umi.identity.publicKey,
                        verified: true,
                        percentageShare: 100,
                    },
                ],
                configLineSettings: some({
                    prefixName: "",
                    nameLength: 32,
                    prefixUri: "",
                    uriLength: 200,
                    isSequential: false,
                })
            })
            const tx = await createNftInstructionBuilder.sendAndConfirm(umi);

            const candyMachineSignature = tx.signature
            const candyMachineSigString = bs58.encode(candyMachineSignature)
            await confirmSignature(candyMachineSigString, "finalized")

            await addConfigLines(umi, {
                candyMachine: candyMachine.publicKey,
                index: 0,
                configLines: [
                    {
                        name: "Ticket 1",
                        uri: "https://example.com/path/to/some/json/metadata.json",
                    },
                    {
                        name: "Ticket 2",
                        uri: "https://example.com/path/to/some/json/metadata.json",
                    }
                ]
            }).sendAndConfirm(umi)

            const eventDb = await axios.post<Event>("/api/event/collection", {
                name,
                date: date,
                venue,
                description,
                image: imageUrl,
                maxSeats,
                collectionMint: collectionMint.publicKey,
                candymachineMint: candyMachine.publicKey,
            })

            router.push(`/event/${eventDb.data.id}`)

        } catch (e) {
            console.log(e)
        }
    }

    const confirmSignature = async (signature: string, commitment: Commitment) => {
        const blockhash = await connection.getLatestBlockhash();
        const status = await connection.confirmTransaction({
            signature,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }, commitment);
        console.log("Transaction status", JSON.stringify(status));
    }

    const getCandyMachine = async () => {
        const candyMachine = await fetchCandyMachine(umi, publicKey("GsRowaak1gPDoYNXn4WBENntj2CoYBmuSuSXD5ppusiT"))
        const collectionMint = new PublicKey("3bmMjzg9gYaADTksrUh85nh5Tgkf4ygzHAvWSGDyvT2J")
        const collection = await metaplex.nfts().findByMint({
            mintAddress: collectionMint
        })
        console.log(candyMachine, "Candy Machine");


        const collectionUpdateAuthority = publicKey(collection.updateAuthorityAddress.toBase58())

        const nftMint = generateSigner(umi);
        const tx = await transactionBuilder()
            .add(setComputeUnitLimit(umi, { units: 800_000 }))
            .add(
                mintV2(umi, {
                    candyMachine: candyMachine.publicKey,
                    nftMint,
                    collectionMint: publicKey(collectionMint.toBase58()),
                    collectionUpdateAuthority: collectionUpdateAuthority,
                    tokenStandard: candyMachine.tokenStandard,
                })
            )
            .sendAndConfirm(umi, {
                send: {
                    skipPreflight: true,
                }
            });
        console.log(candyMachine, "Candy Machine");
        console.log(collectionMint, "Collection Mint");
        console.log(nftMint, "NFT Mint");
    }


    return (
        <div className="h-screen flex flex-col gap-2 items-center justify-center">
            <div className="text-3xl font-bold">
                Create Event
            </div>
            <div>
                <div>
                    Name
                </div>

                <input
                    type="text"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                    }}
                />
            </div>

            <div>
                <div>
                    Date
                </div>

                <input
                    type="date"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={date}
                    onChange={(e) => {
                        setDate(e.target.value)
                    }}
                />
            </div>

            <div>
                <div>
                    Venue
                </div>

                <input
                    type="text"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={venue}
                    onChange={(e) => {
                        setVenue(e.target.value)
                    }}
                />
            </div>

            <div>
                <div>
                    Description
                </div>

                <textarea
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                    }}
                >
                </textarea>
            </div>

            <div>
                <div>
                    Image Url
                </div>

                <input
                    type="text"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={imageUrl}
                    onChange={(e) => {
                        setImageUrl(e.target.value)
                    }}
                />
            </div>

            <div>
                <div>
                    Max number of seats
                </div>

                <input
                    type="number"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={maxSeats}
                    onChange={(e) => {
                        setMaxSeats(parseInt(e.target.value))
                    }}
                />
            </div>

            <button
                className="bg-purple-700 hover:bg-purple-900 duration-200 rounded-md w-96 py-2 text-white mt-4"
                onClick={() => {
                    createCollection()
                }}
            >
                Create Event
            </button>

            <button
                className="bg-purple-700 hover:bg-purple-900 duration-200 rounded-md w-96 py-2 text-white mt-4"
                onClick={() => {
                    getCandyMachine()
                }}
            >
                Mint
            </button>

            <WalletModalProvider>
                <div className="bg-purple-800 hover:bg-black rounded-md flex">
                    <WalletMultiButton className="w-full" />
                </div>
            </WalletModalProvider>
        </div>
    )
}

export default Page