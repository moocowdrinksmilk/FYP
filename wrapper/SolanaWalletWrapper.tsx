import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, useAnchorWallet, WalletProvider } from "@solana/wallet-adapter-react"
import { GlowWalletAdapter, LedgerWalletAdapter, PhantomWalletAdapter, SlopeWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from "@solana/wallet-adapter-wallets"
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
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new GlowWalletAdapter(),
            // new SolletWalletAdapter({ network }),
            // new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    )

    return (
        <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
            <WalletProvider wallets={wallets}>

                {props.children}
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletWrapper