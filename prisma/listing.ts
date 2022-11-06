import { listed, PrismaClient } from "@prisma/client"

const getListingsByCollectionId = async (id: string) => {
    let res: listed[] = []
    try {
        const db = new PrismaClient()
        const listed = await db.listed.findMany({
            where: {
                collectionId: id
            }
        })
        res = listed
    } catch(e) {
        console.log(e);
    }
    return res
}

export const ListingRepository = {
    getListingsByCollectionId
}