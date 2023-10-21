import {Request, Response} from "express";

import {prisma} from "../db";
import {DiskManager} from "../services/DiskManager";

import {AppException} from "../common/AppException";

export class AdsController {
    async show(request: Request, response: Response) {
        const adId = Number(request.params.id);

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
                        profile_picture: true,
                        first_name: true,
                        last_name: true,
                        phone: true
                    }
                }
            }
        })

        if (!ad) {
            throw new AppException('Ad not found.', 404);
        }

        return response.json(ad);
    }

    async index(request: Request, response: Response) {
        const userId = parseInt(request.user.id);

        const is_new = request.query.is_new === undefined ? undefined : request.query.is_new === 'true'
        const query = typeof request.query.query === 'string' ? request.query.query : undefined
        const categories = request.query.categories === undefined ? undefined : typeof request.query.categories === 'string' && JSON.parse(request.query.categories)
        console.log(request)
        const ads = await prisma.ads.findMany({
            where: {
                user_id: {
                    not: userId
                },
                is_new,
                title: {
                    contains: query
                }
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
                        name: true
                    }
                },
                user: {
                    select: {
                        profile_picture: true
                    }
                }
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
            category
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

        const selectedCategory = await prisma.category.findUnique({
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

        const ad = await prisma.ads.create({
            data: {
                description,
                is_new,
                title,
                category_id: selectedCategory.id,
                price,
                user_id: userId
            }
        })
        return response.status(201).json(ad);
    }

    async update(request: Request, response: Response) {
        const {
            title,
            description,
            is_new,
            price
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

        ad.description = description ?? ad.description
        ad.is_new = is_new ?? ad.is_new
        ad.title = title ?? ad.title
        ad.price = price ?? ad.price
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
}