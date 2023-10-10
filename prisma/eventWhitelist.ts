import { PrismaClient } from "@prisma/client"


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

export const EventWhitelistRepository = {
    isWhiteListed
}