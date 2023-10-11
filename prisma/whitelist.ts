import { PrismaClient } from "@prisma/client"

const getWhitelists = async (publicKey: string) => {
    const db = new PrismaClient()
    const whitelists = await db.whitelist.findMany({
        where: {
            pubkey: publicKey
        }
    })
    return whitelists
}

const checkWalletWhitelisted = async (publicKey: string) => {
    const db = new PrismaClient()
    const whitelists = await db.whitelist.findMany({
        where: {
            pubkey: publicKey
        }
    })
    return whitelists.length > 0
}

export const WhitelistRepository = {
    
    getWhitelists,
    checkWalletWhitelisted
}