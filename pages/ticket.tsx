import { useWallet } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl, Connection, Transaction } from "@solana/web3.js"
import axios from "axios"
import bs58 from "bs58"
import React, { useMemo, useState } from "react"

const Ticket = () => {

    const wallet = useWallet()
    const [listed, setListed] = useState(false)

    const mint = async () => {
        if (!wallet.signMessage || !wallet.signTransaction) {
            return
        }
        const nonce = await axios.get<{ nonce: string }>(`/api/marketplace/minting/nonce/?pubkey=${wallet.publicKey?.toBase58()}`)
        let n = nonce.data.nonce

        const encoder = new TextEncoder()
        const signatureu8 = await wallet.signMessage(encoder.encode(n))
        const signature = bs58.encode(signatureu8)

        const res = await axios.post<{ transaction: string[] }>(`/api/marketplace/minting/mint`, {
            collectionAddr: "311MVQ967Yku9Bq9jSdbdYpzykCDqDyRnK8Hoh6be9y5",
            publicKey: wallet.publicKey?.toBase58(),
            signature: signature
        })
        const connection = new Connection(clusterApiUrl('mainnet-beta'))
        const txn = Transaction.from(bs58.decode(res.data.transaction[0]))

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext()

        txn.recentBlockhash = blockhash
        txn.lastValidBlockHeight = lastValidBlockHeight


        let signedtx = await wallet.signTransaction(txn)
        try {
            // const signature = connection.sendRawTransaction(signedtx.serialize())
            const signature = await wallet.sendTransaction(signedtx, connection, { minContextSlot, preflightCommitment: 'confirmed' })

        } catch (e) {
            console.log(e);
            
        }

    }

    useMemo(() => {
        if (!wallet.connected) {
            return
        }
        const getlist = async () => {
            const res = await axios.get<{ list: any[] }>(`/api/marketplace/mint/ticket/?key=${wallet.publicKey?.toBase58()}`)
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
                    wallet.connected ?
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