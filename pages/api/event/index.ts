import { NextApiResponse } from "next";
import { EventRepository } from "../../../prisma/event";
import { v4 } from "uuid";

interface Req {
    body: {
        name: string,
        date: Date,
        venue: string,
        description: string,
        image: string,
        maxSeats: number,
    }
}

const handler = async (req: Req, res: NextApiResponse) => {
    try {
        const event = await EventRepository.createEvent({
            id: v4(),
            name: req.body.name,
            date: req.body.date,
            venue: req.body.venue,
            description: req.body.description,
            image: req.body.image,
            maxSeats: req.body.maxSeats,
        })

        return res.status(200).send(event)
    } catch(e: any) {
        return res.status(400).send({message: e.message})
    }
}

export default handler