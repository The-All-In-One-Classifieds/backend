import {Request, Response} from "express";
import {prisma} from "../db";
import {AppException} from "../common/AppException";
import {stat} from "fs";

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

        const existing = await prisma.userAdsBids.findMany({
            where: {
                sender_id: buyerId,
                receiver_id: sellerId,
                bid_amount: bidAmount,
                status: 'pending'
            }
        })

        if(existing.length > 0) {
            throw new AppException("An existing bid with same configuration is pending")
        }

        const bidInfo = await prisma.userAdsBids.create({
            data: {
                sender_id: buyerId,
                receiver_id: sellerId,
                ad_id: adId,
                bid_amount: bidAmount,
                status: 'pending',
                message: message,
                created_at: new Date()
            }
        })

        return response.status(204).json();
    }

    async userBids(request: Request, response: Response) {
        const userId = parseInt(request.user.id);
        const bidType = request.query.type

        const isSent = !(bidType === 'received')

        let whereCondition : any = {}
        if(isSent) {
            whereCondition = {
                sender_id: userId
            }
        } else {
            whereCondition = {
                receiver_id: userId
            }
        }

        const bids = await prisma.userAdsBids.findMany({
            where: whereCondition,
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

    async update(request: Request, response: Response) {
        const userId = parseInt(request.user.id);
        const bidId = Number(request.body.bid_id)
        const status = String(request.body.status);

        if(!(status === 'accepted' || status === 'rejected')) {
            throw new AppException("Status is not valid")
        }

        const existing = await prisma.userAdsBids.findMany({
            where: {
                id: bidId
            }
        })

        console.log("checkpoint   ", existing);

        if(existing.length === 0) {
            throw new AppException("Bid does not exist")
        }

        const bid = existing[0];
        if(bid.receiver_id !== userId) {
            throw new AppException("You cannot modify this bid");
        }

        if(bid.status !== 'pending') {
            throw new AppException("Bid has already been accepted/rejected");
        }

        bid.status = status;

        await prisma.userAdsBids.update({
            where: {
                id: bidId
            },
            data: {
                ...bid
            }
        })

        return response.status(204).json()
    }
}
