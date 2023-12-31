import { useWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import axios from 'axios'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useMemo } from 'react'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const wallet = useWallet()
  const connection = new Connection(clusterApiUrl('mainnet-beta'))
  useMemo(() => {
    const purchaseListing = async () => {
      if (!wallet.publicKey) {
        return
      }
      const mintPrice = 100000000
      const minter = wallet.publicKey.toString()
      const ticketName = "Rui Rui's Comedy Convention"
      const ticketSymbol = "RRCC"
      const collectionAddress = "86Pg9nnEmr6Xdv7TvdKMpbhGG7HFLnjiJTdCNJAEcCpu"
      const ticketDescription = "A Ticket for entry to Rui Rui's Comedy Convention"
      const ticketImageUrl = "https://arweave.net/93UszKWYRUaqDXIWMapy0FrSaldZ9tCbSQDn1GyQdLc"
      
      const resp = await axios.post('/api/marketplace/mint', {
        mintPrice: mintPrice,
        ticketDetails: {
            collectionAddress: collectionAddress,
            ticketName: ticketName,
            ticketSymbol: ticketSymbol,
            ticketDescription: ticketDescription,
            ticketImage: ticketImageUrl,
            ticketRoyalties: 800,
            attributes: [],
            creators: [],
        },
        minter: minter
    })
      console.log(resp)
      const txn = Transaction.from(Buffer.from(resp.data.transaction))
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await connection.getLatestBlockhashAndContext()
      
    
      const signature = await wallet.sendTransaction(txn, connection, { minContextSlot, preflightCommitment: 'processed'})
    }
    purchaseListing()
  }, [wallet.connected, wallet.publicKey])
  return (
    <div className="h-full bg-green-100">
      <div className="w-1/2">
        <WalletModalProvider>
          <div className="bg-purple-800 hover:bg-black rounded-md flex">
            <WalletMultiButton className="w-full" />
          </div>
        </WalletModalProvider>
      </div>
    </div>
  )
}

export default Home
