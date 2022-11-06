import { Metadata } from "@metaplex-foundation/js"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import axios from "axios"
import React, { useMemo, useState } from "react"
import ListedItem from "../components/listing/ListedItem"


const Listing = () => {
    const wallet = useWallet()
    const [nfts, setNfts] = useState<Metadata[]>()
    
    useMemo(() => {
        if (!wallet.connected) {
            return
        }

        const getNfts = async () => {
            const res = await axios.post<{nfts: Metadata[]}>(`/api/nft/?pubkey=${wallet.publicKey}`)
            setNfts(res.data.nfts)
        }

        getNfts()
    }, [wallet.connected])
    return (
        <div className="h-screen flex flex-col gap-6 bg-gray-900 overflow-auto px-20 pt-10">
            <WalletModalProvider>
                <div className="bg-purple-800 hover:bg-black rounded-md flex">
                    <WalletMultiButton className="w-full" />
                </div>
            </WalletModalProvider>

            {
                nfts &&
                nfts.map((item, index) => {
                    if (!item.creators || item.creators.length < 1) {
                        return
                    }
                    return (
                        <ListedItem 
                            uri={item.uri}
                            name={item.name}
                            price={2}
                            // @ts-ignore
                            publicKey={item.mintAddress}
                            // @ts-ignore
                            creatorKey={item.address}
                            listing={true}
                        />
                    )
                })
            }
        </div>
    )
}

export default Listing