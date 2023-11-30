import { NextApiRequest, NextApiResponse } from "next";
import { EventRepository } from "../../../../prisma/event";
import { v4 } from "uuid";
import { DateTime } from "luxon";

interface Req {
    body: {
        name: string,
        date: string,
        venue: string,
        description: string,
        image: string,
        maxSeats: number,
        collectionMint: string,
        candymachineMint: string,
    },
    method: string;
}

export default async function handler (req: Req, res: NextApiResponse) {
    const { body, method } = req;

    if (method == "POST") {
        try {
            const dateObject = DateTime.fromFormat(body.date, 'yyyy-LL-dd').toJSDate();
            const event = await EventRepository.createEvent({
                ...body,
                date: dateObject,
                id: v4(),
            })
    
            return res.status(200).send(event)
        } catch (error) {
            console.log(error);
            
            return res.status(500).json({ error });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}