import axios from "axios"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Event } from '@prisma/client'
import { DateTime } from "luxon"
import BuyModal from "../../components/buy/BuyModal"

const Page = () => {
    const router = useRouter()
    const { id } = router.query

    const [event, setEvent] = useState<Event | null>(null)

    const buyTicket = async () => {
        
    }

    useEffect(() => {
        if (!id) {
            return
        }

        const getEvent = async () => {
            try {
                const res = await axios.get<Event>(`/api/event`, {
                    params: {
                        id
                    }
                })
                setEvent(res.data)
            } catch (e) {
                console.log(e)
            }
        }

        getEvent()
    }, [id])

    return (
        <div
            className="h-screen overflow-auto py-10"
        >
            <div
                className="flex flex-row justify-center items-center"
            >
                <div
                    className="col flex flex-col gap-2"
                >
                    {
                        event?.image &&
                        <div
                            className="w-64 h-64 relative"
                        >
                            <Image
                                src={event?.image}
                                objectFit="contain"
                                layout="fill"
                                unoptimized={true}
                                className="rounded-lg"
                            />
                        </div>
                    }

                    <div>
                        <div
                            className="text-xs text-gray-400 font-semibold"
                        >
                            Event Name:
                        </div>

                        <div
                            className="text-lg font-bold"
                        >
                            {event?.name}
                        </div>
                    </div>

                    <div>
                        <div
                            className="text-xs text-gray-400 font-semibold"
                        >
                            Description:
                        </div>

                        <div
                            className="text-lg font-bold"
                        >
                            {event?.description}
                        </div>
                    </div>

                    <div>
                        <div
                            className="text-xs text-gray-400 font-semibold"
                        >
                            Venue:
                        </div>

                        <div
                            className="text-lg font-bold"
                        >
                            {event?.venue}
                        </div>
                    </div>

                    <div>
                        <div
                            className="text-xs text-gray-400 font-semibold"
                        >
                            Date:
                        </div>

                        <div
                            className="text-lg font-bold"
                        >
                            {
                                event?.date &&
                                DateTime.fromISO(event?.date.toString()).toLocaleString(DateTime.DATETIME_MED)
                            }
                        </div>
                    </div>

                    <BuyModal
                        id={id as string}
                    />
                </div>
            </div>
        </div>
    )
}

export default Page