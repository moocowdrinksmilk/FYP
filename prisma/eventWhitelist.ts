import { PrismaClient } from "@prisma/client"
import { v4 } from "uuid"


const isWhiteListed = async (eventId: string, wallet: string) => {
    try {
        const db = new PrismaClient()
        
        const eventWhitelist = await db.eventWhitelist.findFirstOrThrow({
            where: {
                eventId: eventId,
                address: wallet
            }
        })
        return eventWhitelist
    } catch(e) {
        throw e
    }
}

const addWhitelists = async (eventId: string, wallets: string[]) => {
    try {
        const db = new PrismaClient()
        
        const eventWhitelists = await db.eventWhitelist.createMany({
            data: wallets.map(wallet => ({
                id: v4(),
                eventId: eventId,
                address: wallet
            }))
        })
        return eventWhitelists
    } catch(e) {
        throw e
    }

}

export const EventWhitelistRepository = {
    isWhiteListed,
    addWhitelists
}