import { getEndedAuctions } from "../../lib/getEndedAuction";
import { closeAuction } from "../../lib/closeAuction";
import createError from 'http-errors'

async function processAuctions(event) {   
    try {
        const auctionToClose= await getEndedAuctions();
        const closePromises= auctionToClose.map(auction => closeAuction(auction));
        await Promise.all((closePromises))
        return { closed: closePromises.length };
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
}

export const handler= processAuctions;