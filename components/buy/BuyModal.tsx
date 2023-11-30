import { fetchCandyMachine, mintV2, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine"
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata"
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { awsUploader } from "@metaplex-foundation/umi-uploader-aws"
import { EventWhitelist } from "@prisma/client"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { Modal } from "antd"
import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { Umi, generateSigner, publicKey, transactionBuilder } from "@metaplex-foundation/umi"
import { Connection, PublicKey } from "@solana/web3.js"
import { Metaplex, bundlrStorage } from "@metaplex-foundation/js"
import { Event } from "@prisma/client"
import { setComputeUnitLimit, freezeToken } from "@metaplex-foundation/mpl-toolbox";

interface props {
    id: string
}

const BuyModal = (props: props) => {

    const wallet = useWallet()

    const [open, setOpen] = useState(false)
    const [whitelisted, setWhitelisted] = useState(false)
    const [nft, setNft] = useState<string | null>(null)
    const [buyLoading, setBuyLoading] = useState(false)

    useEffect(() => {
        const isWhitelisted = async () => {
            try {
                console.log(wallet.publicKey?.toBase58(), props.id);
                
                const res = await axios.get<EventWhitelist>("/api/event/whitelist", {
                    params: {
                        address: wallet.publicKey?.toBase58(),
                        id: props.id
                    }
                })

                setWhitelisted(true)
            } catch (e) {
                console.log(e)
            }
        }

        if (wallet.connected) {
            isWhitelisted()
        }
    }, [wallet.connected])

    const rpcEndpoint = "https://api.devnet.solana.com"

    const umi = useMemo(() =>
        createUmi("https://api.devnet.solana.com")
            .use(walletAdapterIdentity(wallet!, true))
            .use(mplTokenMetadata())
            .use(mplCandyMachine()),
        [rpcEndpoint, wallet]);

    const buy = async () => {
        try {
            setBuyLoading(true)
            const res = await axios.post<{
                mint: string
            }>("/api/event/nft/mint", {
                eventId: props.id,
            })

            setNft(res.data.mint)
        } catch (e) {
            console.log(e)
        } finally {
            setBuyLoading(false)
        }
    }

    const getCandyMachine = async () => {
        try {
            setBuyLoading(true)
            const connection = new Connection("https://api.devnet.solana.com", "confirmed")
            const metaplex = Metaplex.make(connection).use(bundlrStorage({
                address: 'https://devnet.bundlr.network',
                providerUrl: 'https://api.devnet.solana.com',
                timeout: 60000,
            }));

            const res = await axios.get<Event>(`/api/event`, {
                params: {
                    id: props.id
                }
            })
            
            const candyMachine = await fetchCandyMachine(umi, publicKey(res.data.candymachineMint as string))
            const collectionMint = new PublicKey(res.data.collectionMint as string)
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
        } catch (e) {
            console.log(e)
        } finally {
            setBuyLoading(false)
        }
    }

    return (
        <>
            <button
                className="bg-green-500 hover:bg-green-600 duration-200 rounded-md text-white px-4 py-2"
                onClick={() => {
                    setOpen(true)
                }}
            >
                Buy Ticket
            </button>
            <Modal
                open={open}
                onCancel={() => {
                    setOpen(false)
                }}
                footer={null}
                closable={false}
            >
                <div
                    className="flex flex-col gap-4"
                >
                    <div
                        className="text-2xl font-bold"
                    >
                        Buy Ticket
                    </div>

                    {
                        wallet.connected ?
                            whitelisted ?
                                <button
                                    className="flex flex-row justify-center gap-2 bg-green-500 hover:bg-green-600 duration-200 rounded-md text-white px-4 py-2"
                                    onClick={() => {
                                        getCandyMachine()
                                    }}
                                >
                                    Buy Ticket {
                                        buyLoading &&
                                        <div
                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                                        >

                                        </div>
                                    }
                                </button>
                                :
                                <div
                                    className="bg-red-500 hover:bg-red-600 duration-200 rounded-md text-white px-4 py-2"
                                    onClick={() => {
                                        setOpen(false)
                                    }}
                                >
                                    Not Whitelisted
                                </div>
                            :
                            <WalletModalProvider>
                                <div className="bg-purple-800 hover:bg-black rounded-md flex">
                                    <WalletMultiButton className="w-full" />
                                </div>
                            </WalletModalProvider>
                    }


                    {
                        nft &&
                        <div>
                            <div>
                                View your NFT at:
                            </div>
                            <div>
                                <a
                                    href={`https://solscan.io/token/${nft}?cluster=devnet`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    SolScan Link
                                </a>
                            </div>
                        </div>
                    }
                </div>
            </Modal>
        </>
    )
}

export default BuyModal