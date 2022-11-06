import { listed } from '@prisma/client'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Skeleton } from 'antd'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'
import ListedItem from '../../components/listing/ListedItem'
import { ListingRes } from '../api/listing'

const Collection = () => {
    const router = useRouter()
    const { id } = router.query

    const [collection, setCollection] = useState<ListingRes[]>([])

    useMemo(() => {
        if (!id) {
            return
        }
        const getCollection = async () => {
            const res = await axios.get<ListingRes[]>(`/api/listing/?collection_id=${id}`)
            setCollection(res.data)
        }
        getCollection()
    }, [id])

    return (
        <div className="h-screen flex flex-col gap-6 bg-gray-900 overflow-auto px-20 pt-10">
            <WalletModalProvider>
                <div className="bg-purple-800 hover:bg-black rounded-md flex">
                    <WalletMultiButton className="w-full" />
                </div>
            </WalletModalProvider>
            <div className="flex flex-wrap gap-6">
                {
                    collection && collection.length > 0 ?
                        collection.map((collection) => {
                            return (
                                // @ts-ignore
                                <ListedItem
                                    uri={collection.metadata.uri}
                                    name={collection.metadata.name}
                                    price={collection.price}
                                    publicKey={collection.mintAddress}
                                />
                            )
                        })
                        :
                        <Skeleton
                            active
                            paragraph={{ rows: 4 }}
                        />
                }
            </div>
        </div>
    )
}

export default Collection