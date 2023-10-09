import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, useAnchorWallet, WalletProvider } from "@solana/wallet-adapter-react"
import { LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl, Connection } from "@solana/web3.js"
import React, { useMemo } from "react"

interface props {
    children: any
}
require('@solana/wallet-adapter-react-ui/styles.css');


const WalletWrapper = (props: props) => {
    // const network = 'http://127.0.0.1:8899';
    const network = WalletAdapterNetwork.Mainnet;

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            // new SolletWalletAdapter({ network }),
            // new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    )

    return (
        <ConnectionProvider endpoint={"https://magical-light-sheet.solana-mainnet.quiknode.pro/96f2fb37a3247ee895fd0d36694966e86f6448d9/"}>
            <WalletProvider wallets={wallets}>

                {props.children}
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletWrapper