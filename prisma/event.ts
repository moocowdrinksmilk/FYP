import { Event, PrismaClient } from "@prisma/client"


const createEvent = async (data: Event) => {
    const db = new PrismaClient()
    try {
        const event = await db.event.create({
            data
        })

        return event
    }
    catch(e) {
        throw e
    }
}

export const EventRepository = {
    createEvent
}