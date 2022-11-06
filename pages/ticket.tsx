import { useWallet } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import axios from "axios"
import React, { useMemo, useState } from "react"

const Ticket = () => {

    const wallet = useWallet()
    const [listed, setListed] = useState(false)

    const mint = async () => {

    }

    useMemo(() => {
        if (!wallet.connected) {
            return
        }
        const getlist = async () => {
            const res = await axios.get<{list: any[]}>(`/api/marketplace/mint/ticket/?key=${wallet.publicKey?.toBase58()}`)
            if (res.data.list.length > 0) {
                setListed(true)
            }
        }
        getlist()
    }, [wallet.connected])
    return (
        <div className="h-screen flex flex-col gap-6 bg-gray-900 overflow-auto px-20 pt-10">
            <div>

            </div>

            {
                !wallet.connected &&
                <WalletModalProvider>
                    <div className="bg-purple-800 hover:bg-black rounded-md flex">
                        <WalletMultiButton className="w-full" />
                    </div>
                </WalletModalProvider>
            }

            <button className="text-white bg-green-400/50 px-4 py-2 rounded-lg"
                onClick={() => {
                    mint()
                }}
            >
                {
                    wallet.connected?
                        listed ?
                        "Buy your ticket!"
                        :
                        "You are not allowed to this Pre-Sale :<"
                    :
                    "Connect your wallet to buy your ticket :<"
                }
            </button>
        </div>
    )
}

export default Ticket