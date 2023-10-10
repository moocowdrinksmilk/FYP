import { Event } from "@prisma/client"
import axios from "axios"
import { useState } from "react"
import { DateTime } from "luxon"
import { useRouter } from "next/router"

const Page = () => {
    const router = useRouter()

    const [name, setName] = useState('')
    const [date, setDate] = useState('')
    const [venue, setVenue] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [maxSeats, setMaxSeats] = useState(0)

    const [event, setEvent] = useState<Event | null>(null)

    const createEvent = async () => {
        const jsDate = DateTime.fromFormat(date, "yyyy-LL-dd").toJSDate()
        try {
            const res = await axios.post<Event>("/api/event", {
                name,
                date: jsDate,
                venue,
                description,
                image: imageUrl,
                maxSeats
            })

            router.push(`/event/${res.data.id}`)
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div className="h-screen flex flex-col gap-2 items-center justify-center">
            <div className="text-3xl font-bold">
                Create Event
            </div>
            <div>
                <div>
                    Name
                </div>

                <input
                    type="text"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                    }}
                />
            </div>

            <div>
                <div>
                    Date
                </div>

                <input
                    type="date"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={date}
                    onChange={(e) => {
                        setDate(e.target.value)
                    }}
                />
            </div>

            <div>
                <div>
                    Venue
                </div>

                <input
                    type="text"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={venue}
                    onChange={(e) => {
                        setVenue(e.target.value)
                    }}
                />
            </div>

            <div>
                <div>
                    Description
                </div>

                <textarea
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                    }}
                >
                </textarea>
            </div>

            <div>
                <div>
                    Image Url
                </div>

                <input
                    type="text"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={imageUrl}
                    onChange={(e) => {
                        setImageUrl(e.target.value)
                    }}
                />
            </div>

            <div>
                <div>
                    Max number of seats
                </div>

                <input
                    type="number"
                    className="bg-gray-100 w-96 rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    value={maxSeats}
                    onChange={(e) => {
                        setMaxSeats(parseInt(e.target.value))
                    }}
                />
            </div>

            <button
                className="bg-purple-700 hover:bg-purple-900 duration-200 rounded-md w-96 py-2 text-white mt-4"
                onClick={() => {
                    createEvent()
                }}
            >
                Create Event
            </button>
        </div>
    )
}

export default Page