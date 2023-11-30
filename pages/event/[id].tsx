import axios from "axios"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Event } from '@prisma/client'
import { DateTime } from "luxon"
import BuyModal from "../../components/buy/BuyModal"
import Dragger from "antd/lib/upload/Dragger"
import { BsInbox } from "react-icons/bs"
import { UploadProps } from "antd"
import { RcFile } from "antd/lib/upload"

const Page = () => {
    const router = useRouter()
    const { id } = router.query

    const [event, setEvent] = useState<Event | null>(null)

    const buyTicket = async () => {

    }
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        customRequest: async ({ file, onSuccess, onError }) => {
            const uploadFile = file as RcFile
            const name = uploadFile.name
            console.log(name);
            console.log(uploadFile);
            
            try {
                const reader = new FileReader();
                let wallets: string[] = []
                reader.onload = async (e) => {
                    try {
                        const text = e.target?.result as string;
                        const lines = text.split('\n');
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            if (line.length > 0) {
                                wallets.push(line.trim())
                            }
                        }

                        const res = await axios.post("/api/whitelist", {
                            eventId: id,
                            wallets: wallets
                        })
                        // Here you can process the CSV lines
                        // For example, log them or store them in a state
                        lines.forEach(line => console.log(line));
        
                        onSuccess("File processed successfully");
                    } catch (error) {
                        onError(error);
                    }
                };
                reader.onerror = (error) => {
                    onError(error);
                };
                reader.readAsText(uploadFile);
                // @ts-ignore
                onSuccess({}, {})
            } catch (error) {
                // @ts-ignore
                onError(error)
            }
        },
        method: "POST",
        headers: {
            "Content-Type": "application/pdf"
        },
        onDrop(e) {
            console.log(e);

        },
    };

    
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

                    <Dragger
                        {...props}
                    >
                        <div
                            className="flex flex-col items-center justify-center gap-2 py-6 px-14"
                        >
                            <BsInbox
                                className="text-6xl text-neutral-400"
                            />
                            <div
                                className="text-lg font-semibold text-neutral-400"
                            >
                                Drag and drop whitelist csv now!
                            </div>
                        </div>
                    </Dragger>

                    <BuyModal
                        id={id as string}
                    />
                </div>
            </div>
        </div>
    )
}

export default Page