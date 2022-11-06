import '../styles/globals.css'
import 'tailwindcss/tailwind.css';

import type { AppProps } from 'next/app'
import React from 'react';
import SolanaWalletWrapper from '../wrapper/SolanaWalletWrapper';

function MyApp({ Component, pageProps }: AppProps) {

  return (
      <SolanaWalletWrapper>
        <Component {...pageProps} />
      </SolanaWalletWrapper>
  )
}
export default MyApp
