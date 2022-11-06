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

export const WhitelistRepository = {
    getWhitelists
}