import Modal from 'antd/lib/modal/Modal'
import axios from 'axios'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import numeral from 'numeral'
import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, Transaction, VersionedMessage } from '@solana/web3.js'
import bs58 from 'bs58'
import { WalletKeypairError, WalletNotConnectedError } from '@solana/wallet-adapter-base'

interface props {
    uri: string
    name: string
    price: number
    publicKey: string
    creatorKey: string
    listing?: boolean
}

export type NftData = {
    image: string
    collection: {
        name: string
    }
}

const ListedItem = (props: props) => {
    const wallet = useWallet()

    const [image, setImage] = useState("")
    const [modal, setModal] = useState(false)

    useMemo(() => {
        const getMetaData = async (tries: number) => {
            if (tries > 1) {
                return
            }
            try {
                const res = await axios.get<NftData>(props.uri)
                setImage(res.data.image)
            } catch (e: any) {
                console.log(e.message);
                getMetaData(tries + 1)
            }

        }
        getMetaData(0)
    }, [props.uri])

    const buy = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            throw WalletNotConnectedError
        }
        const connection = new Connection("https://magical-light-sheet.solana-mainnet.quiknode.pro/96f2fb37a3247ee895fd0d36694966e86f6448d9/")

        const res = await axios.post<{ transaction: string[] }>(`/api/marketplace/buy`, {
            mintAddress: props.publicKey,
            publicKey: wallet.publicKey
        })

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
        // const signature = await wallet.sendTransaction(signedtx, connection, { minContextSlot, preflightCommitment: 'processed' })
    }

    const list = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            throw WalletNotConnectedError
        }
        const connection = new Connection("https://magical-light-sheet.solana-mainnet.quiknode.pro/96f2fb37a3247ee895fd0d36694966e86f6448d9/")

        const res = await axios.post<{ transaction: string[] }>(`/api/marketplace/list`, {
            mintAddress: props.publicKey,
            price: 0.01,
            publicKey: wallet.publicKey,
            collectionId: props.creatorKey
        })
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

        // const {
        //     context: { slot: minContextSlot },
        //     value: { blockhash, lastValidBlockHeight }
        // } = await connection.getLatestBlockhashAndContext()


        // const signature = await wallet.sendTransaction(txn, connection, { minContextSlot, preflightCommitment: 'confirmed' })
    }

    return (
        <>
            <Modal
                visible={modal}
                closable={false}
                footer={null}
                style={{
                    backgroundColor: "#17202E"
                }}
                bodyStyle={{
                    backgroundColor: "#17202E"
                }}
                title={null}
                onCancel={() => { setModal(false) }}
            >
                <div className="flex flex-col text-white gap-2">
                    <div className="text-xl">
                        {props.name}
                    </div>

                    {
                        !props.listing ?
                            <button className="bg-green-400/50 hover:bg-green-500/50 rounded-lg px-4 py-1"
                                onClick={() => { buy() }}
                            >
                                Buy
                        </button>
                            :
                            <button className="bg-green-400/50 hover:bg-green-500/50 rounded-lg px-4 py-1"
                                onClick={() => { list() }}
                            >
                                List
                        </button>
                    }
                </div>
            </Modal>
            <div className="col gap-4 bg-gray-800 rounded-lg cursor-pointer"
                onClick={() => { setModal(true) }}
            >
                <Image
                    src={image ? "https://res.cloudinary.com/demo/image/fetch/" + image : "/image-not-available.png"}
                    width={260}
                    height={260}
                />

                <div className="flex flex-col gap-2 text-gray-100 p-2">
                    <div className="text-gray-100 text-sm">
                        {
                            props.name
                        }
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <div className="w-4 h-4 relative">
                            {!props.listing && 
                            <Image
                                src="/solanaLogoMark.png"
                                layout="fill"
                                objectFit="contain"
                            />}
                        </div>

                        <div>
                            {
                                !props.listing &&
                                numeral(props.price).format('0.00')
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ListedItem