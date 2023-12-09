import {Request, Response} from "express";
import {prisma} from "../db";
import {AppException} from "../common/AppException";

export class BidsController {
    async create(request: Request, response: Response) {
        const buyerId = parseInt(request.user.id);
        const adId = Number(request.body.ad_id);
        const bidAmount = Number(request.body.bid_amount);
        const message = String(request.body.message);

        if(!adId) {
            throw new AppException("Ad id is not valid")
        }

        if(!bidAmount) {
            throw new AppException("Bid amount is not valid")
        }

        if(!message) {
            throw new AppException("Bid message is not valid")
        }

        const seller = await prisma.ads.findUnique({
            where: {
                id: adId
            },
            select: {
                user_id: true
            }
        })

        if(!seller) {
            throw new AppException("Ad id is not valid")
        }

        const sellerId = seller.user_id
        if(buyerId === sellerId) {
            throw new AppException("You cannot place bid on your own ad")
        }

        const bidInfoBuyer = await prisma.userAdsBids.create({
            data: {
                user_id: buyerId,
                ad_id: adId,
                bid_amount: bidAmount,
                status: 'pending',
                is_sent: true,
                message: message,
                created_at: new Date()
            }
        })

        const bidInfoSeller = await prisma.userAdsBids.create({
            data: {
                user_id: sellerId,
                ad_id: adId,
                bid_amount: bidAmount,
                status: 'pending',
                is_sent: false,
                message: message,
                created_at: new Date()
            }
        })

        return response.status(204).json();
    }

    async userBids(request: Request, response: Response) {
        const userId = parseInt(request.user.id);

        const bids = await prisma.userAdsBids.findMany({
            where: {
                user_id: userId
            },
            include: {
                ad: {
                    select: {
                        id: true,
                        price: true,
                        title: true,
                        ad_images: {
                            select: {
                                path: true,
                                name: true,
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
        })

        console.log("Response   \n", bids)
        return response.status(200).json(bids);
    }
}