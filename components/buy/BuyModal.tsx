import { EventWhitelist } from "@prisma/client"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Modal } from "antd"
import axios from "axios"
import { useEffect, useState } from "react"

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
                                        buy()
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