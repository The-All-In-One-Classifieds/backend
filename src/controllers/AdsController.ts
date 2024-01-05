import {Request, Response} from "express";

import {prisma} from "../db";
import {DiskManager} from "../services/DiskManager";

import {AppException} from "../common/AppException";
import {loadavg} from "os";
import * as trace_events from "trace_events";
import {emitSocketEvent, emitSocketEventToChat} from "../socket";
import {ChatEventEnum} from "../common/Constants";

export class AdsController {
    async show(request: Request, response: Response) {
        const adId = Number(request.params.id);
        const userId = parseInt(request.user.id);

        const ad = await prisma.ads.findUnique({
            where: {
                id: adId,
            },
            include: {
                ad_images: {
                    select: {
                        path: true,
                        id: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        profile_picture: true,
                        first_name: true,
                        last_name: true,
                        phone: true
                    }
                },
                location: {
                    select: {
                        longitude: true,
                        latitude: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                in_user_favorite_ads: {
                    where: {
                        user_id: userId
                    },
                    select: {
                        ad_id: true
                    }
                },
            }
        })

        if (!ad) {
            throw new AppException('Ad not found.', 404);
        }

        const favoriteCount = await prisma.userFavoriteAds.count({
            where: {ad_id: adId},
        });

        const bidsCount = await prisma.userAdsBids.count({
            where: {ad_id: adId},
        });

        const isUsersFavorite = ad.in_user_favorite_ads.length > 0;
        const resultAd = {...ad, is_users_favorite: isUsersFavorite, favorites_count: favoriteCount, bids_count: bidsCount};

        return response.json(resultAd);
    }

    async index(request: Request, response: Response) {
        const userId = parseInt(request.user.id);

        const is_new = request.query.is_new === undefined ? undefined : request.query.is_new === 'true'
        const sortString = request.query?.order
        const categoriesStr: string[] = Array.isArray(request.query.categories)
            ? (request.query.categories as string[])
            : [];
        const query = typeof request.query.query === 'string' ? request.query.query : undefined

        let whereCondition: any = {}; // Default empty where condition

        const categories: number[] = categoriesStr?.map(Number);

        if (categories?.length && categories?.length) {
            whereCondition.category_id = {
                in: categories,
            };
        }
        whereCondition.user_id = {
            not: userId,
        };
        whereCondition.is_new = is_new;
        if (query) {
            whereCondition.title = {
                contains: query,
            };
        }

        let sortField = 'updated_at';
        let sortOrder = 'asc';

        if (sortString && typeof sortString === 'string') {
            const [field, order] = sortString.split(' ');
            if (field && order) {
                sortField = field;
                sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
            }
        }

        const ads = await prisma.ads.findMany({
            where: whereCondition,
            orderBy: {
                [sortField]: sortOrder,
            },
            select: {
                id: true,
                title: true,
                price: true,
                is_new: true,
                ad_images: {
                    select: {
                        path: true,
                        id: true,
                        name: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        profile_picture: true
                    }
                },
                location: {
                    select: {
                        longitude: true,
                        latitude: true
                    }
                },
            }
        })

        return response.json(ads);
    }

    async create(request: Request, response: Response) {
        const {
            title,
            description,
            is_new,
            price,
            category,
            is_for_sale,
            location,
            allow_bidding,
        } = request.body

        const userId = parseInt(request.user.id);

        if (!title) {
            throw new AppException("Ad title cannot be empty.")
        }

        if (!description) {
            throw new AppException("Ad description cannot be empty.")
        }

        if (typeof is_new === 'string' ? !is_new : typeof is_new === undefined) {
            throw new AppException("The condition of the Item is Mandatory (New or Used).")
        }

        if (!price) {
            throw new AppException("Ad Price cannot be empty.")
        }

        if (!category) {
            throw new AppException("Ad must belong to a category.")
        }

        if (!is_for_sale) {
            throw new AppException("Ad must be for sale or rent.")
        }

        if (allow_bidding === undefined) {
            throw new AppException("Invalid bidding information.")
        }

        if (!location || location.length !== 2) {
            throw new AppException("Ad must belongs to a location.")
        }

        const selectedCategory = await prisma.categories.findUnique({
            where: {
                name: category
            },
            select: {
                id: true
            }
        })

        if (!selectedCategory) {
            throw new AppException("Selected category is invalid.")
        }

        let address = await prisma.locations.findFirst({
            where: {
                longitude: location[0],
                latitude: location[1],
            },
        })

        if (!address) {
            address = await prisma.locations.create({
                data: {
                    longitude: location[0],
                    latitude: location[1],
                    address_text: "Default address"
                }
            })
        }

        const ad = await prisma.ads.create({
            data: {
                description,
                is_new,
                title,
                category_id: selectedCategory.id,
                price,
                user_id: userId,
                is_for_sale: is_for_sale,
                allow_bidding: allow_bidding,
                location_id: address.id
            }
        })

        return response.status(201).json(ad);
    }

    async update(request: Request, response: Response) {
        const {
            title,
            description,
            is_new,
            price,
            is_for_sale,
            location,
            allow_bidding,
        } = request.body
        const userId = parseInt(request.user.id);
        const adId = Number(request.params.id)

        const ad = await prisma.ads.findUnique({
            where: {
                id: adId,
            }
        })

        if (!ad) {
            throw new AppException("Ad not found.", 404)
        }

        if (ad.user_id !== userId) {
            throw new AppException("You don't have permission to edit this ad", 401)
        }

        let address = await prisma.locations.findFirst({
            where: {
                longitude: location[0],
                latitude: location[1],
            },
        })

        if (!address) {
            address = await prisma.locations.create({
                data: {
                    longitude: location[0],
                    latitude: location[1],
                    address_text: "Default Address",
                }
            })
        }

        ad.description = description ?? ad.description
        ad.is_new = is_new ?? ad.is_new
        ad.title = title ?? ad.title
        ad.price = price ?? ad.price
        ad.location_id = address.id ?? ad.location_id
        ad.is_for_sale = is_for_sale ?? ad.is_for_sale
        ad.allow_bidding = allow_bidding ?? ad.allow_bidding
        ad.updated_at = new Date()

        await prisma.ads.update({
            where: {
                id: adId
            },
            data: {
                ...ad
            }
        })

        return response.status(204).json();
    }

    async patch(request: Request, response: Response) {
        const {
            is_active
        } = request.body
        const userId = parseInt(request.user.id);
        const adId = Number(request.params.id)

        const ad = await prisma.ads.findUnique({
            where: {
                id: adId,
            },
        })

        if (!ad) {
            throw new AppException("Ad not found.", 404)
        }

        if (ad.user_id !== userId) {
            throw new AppException("You don't have permissions to edit this ad", 401)
        }

        await prisma.ads.update({
            data: {
                is_active
            },
            where: {
                id: adId
            }
        })

        return response.status(204).json();
    }

    async delete(request: Request, response: Response) {
        const userId = parseInt(request.user.id);
        const adId = Number(request.params.id)

        const diskManager = new DiskManager();

        const ad = await prisma.ads.findUnique({
            where: {
                id: adId,
            },
            include: {
                ad_images: {
                    select: {
                        path: true
                    }
                }
            }
        })

        if (!ad) {
            throw new AppException("Ad not found.", 404)
        }

        if (ad.user_id !== userId) {
            throw new AppException("You don't have permission to delete this ad.", 401)
        }

        for (const adImage of ad.ad_images) {
            await diskManager.deleteFile(adImage.path)
        }

        await prisma.ads.delete({
            where: {
                id: adId
            }
        })

        return response.status(204).json();
    }

    async toggleAdInFavorites(request: Request, response: Response) {
        const adId = Number(request.params.id);
        const userId = parseInt(request.user.id);
        const existingFavorite = await prisma.userFavoriteAds.findUnique({
            where: {
                ad_id_user_id: {
                    ad_id: adId,
                    user_id: userId,
                },
            },
        });

        if (existingFavorite) {
            // If the ad exists in the user's favorites, remove it
            await prisma.userFavoriteAds.delete({
                where: {
                    ad_id_user_id: {
                        ad_id: adId,
                        user_id: userId,
                    },
                },
            });
        } else {
            // If the ad doesn't exist in the user's favorites, add it
            await prisma.userFavoriteAds.create({
                data: {
                    ad_id: adId,
                    user_id: userId,
                },
            });
        }

        return response.status(204).json();
    }

    async getBidsUsers(request: Request, response: Response) {
        const adId = Number(request.params.id);
        const userId = parseInt(request.user.id);

        const result = await prisma.userAdsBids.findMany({
            where: {
                ad_id: adId,
                receiver_id: userId,
                status: 'accepted'
            },
            select: {
                sender: {
                    select: {
                        id : true,
                        profile_picture: true,
                        first_name: true,
                        last_name: true,
                    }
                }
            }
        })

        if(!result){
            return response.status(200).json([])
        }
        return response.status(200).json(result)
    }

    async getAdChat(request: Request, response: Response) {
        const senderId = parseInt(request.user.id)
        const adID = request.params?.id
        const receiverID = request.params?.receiver

        if (!adID) {
            throw new AppException("Ad Id is invalid")
        }

        if(!receiverID) {
            throw new AppException("Receiver Id is invalid")
        }

        const adId = parseInt(adID)
        const receiverId = parseInt(receiverID)
        const ad = await prisma.ads.findUnique({
            where: {
                id: adId,
                is_active: true
            }
        })

        if (!ad) {
            throw new AppException("Ad does not exist")
        }

        if(senderId === receiverId) {
            throw new AppException("You cannot message yourself")
        }

        const chat = await prisma.chats.findFirst({
            where: {
                ad_id: ad.id,
                OR: [
                    {
                        member_one_id: senderId,
                        member_two_id: receiverId,
                    },
                    {
                        member_one_id: receiverId,
                        member_two_id: senderId,
                    },
                ],
            },
            select: {
                id: true,
                updated_at: true,
                messages: {
                    select: {
                        id: true,
                        sender_id: true,
                        is_seen: true,
                        created_at: true,
                        content: true
                    },
                    orderBy: {
                        created_at: "asc"
                    }
                }
            }
        });

        if(!chat) {
            return response.status(200).json({})
        }

        await prisma.messages.updateMany({
            where: {
                chat_id: chat.id,
                sender_id: receiverId,
                is_seen: false
            },
            data: {
                is_seen: true
            }
        });

        return response.status(200).json(chat)
    }

    async sendMessage(request: Request, response: Response) {
        const senderId = parseInt(request.user.id)
        const adID = request.params?.id
        const message : string = request.body?.message
        const receiverID = request.body?.receiver

        if (!adID) {
            throw new AppException("Ad Id is invalid")
        }

        if(!message || message.length === 0) {
            throw new AppException("Message is not provided")
        }

        if(!receiverID) {
            throw new AppException("Receiver Id is invalid")
        }

        const adId = parseInt(adID)
        const receiverId = parseInt(receiverID)
        const ad = await prisma.ads.findUnique({
            where: {
                id: adId,
                is_active: true
            }
        })

        if (!ad) {
            throw new AppException("Ad does not exist")
        }

        if(senderId === receiverId) {
            throw new AppException("You cannot message yourself")
        }

        let chat : any = await prisma.chats.findFirst({
            where: {
                ad_id: ad.id,
                OR: [
                    {
                        member_one_id: senderId,
                        member_two_id: receiverId,
                    },
                    {
                        member_one_id: receiverId,
                        member_two_id: senderId,
                    },
                ],
            }
        });

        if(!chat) {
            chat = await prisma.chats.create({
                data: {
                    ad_id: adId,
                    member_one_id: senderId,
                    member_two_id: receiverId,
                    updated_at: new Date(),
                    last_message: message,
                }
            })
        }


        const messagePosted = await prisma.messages.create({
            data: {
                sender_id: senderId,
                is_seen: false,
                created_at: new Date(),
                content: message,
                chat_id: chat.id
            }
        })

        await prisma.chats.update({
            where: {
                id: chat.id
            },
            data: {
                last_message: message,
                updated_at: new Date()
            }
        })

        emitSocketEvent(request, ChatEventEnum.CHAT_MESSAGE_RECEIVED_EVENT, {chat_id: messagePosted.chat_id, content: messagePosted.content, updated_at: messagePosted.created_at});
        emitSocketEventToChat(request, chat.id, ChatEventEnum.MESSAGE_RECEIVED_EVENT, messagePosted);
        return response.status(200).json(messagePosted)
    }
}
