import {AdImages} from "@prisma/client";
import {Request, Response} from "express";

import {prisma} from "../db";

import {DiskManager} from "../services/DiskManager";
import {AppException} from "../common/AppException";

export class AdImagesController {
    async create(request: Request, response: Response) {
        const userId = parseInt(request.user.id);
        const adId = parseInt(request.body.ad_id);
        const adFiles = request.files

        const diskStorage = new DiskManager();

        const ad = await prisma.ads.findUnique({
            where: {
                id: adId,
            }
        })

        if (!adFiles || adFiles?.length === 0 || !Array.isArray(adFiles)) {
            throw new AppException("Please provide and Image.")
        }

        if (!ad) {
            adFiles.forEach(async (adFilename) => {
                await diskStorage.deleteFile(adFilename.path)
            })
            throw new AppException("Ad not found.", 404);
        }

        if (ad.user_id !== userId) {
            adFiles.forEach(async (adFilename) => {
                await diskStorage.deleteFile(adFilename.path)
            })
            throw new AppException("You don't have permission to edit the images.", 401);
        }

        const adImages: AdImages[] = []

        if (Array.isArray(adFiles)) {
            for (const adFilename of adFiles) {
                console.log(`Ad file name: ${adFilename}`)
                const filename = await diskStorage.saveFile(adFilename.filename);
                console.log(`file name: ${filename}`)
                const adImage = await prisma.adImages.create({
                    data: {
                        path: filename,
                        ad_id: adId,
                        name: filename,
                    }
                })

                adImages.push(adImage)
            }
        } else {
            throw new AppException("Invalid image format.");
        }

        return response.status(201).json(adImages);
    }

    async delete(request: Request, response: Response) {
        const userId = parseInt(request.user.id);
        const adImagesIds = request.body.adImagesIds;

        const diskStorage = new DiskManager();

        if (adImagesIds.length === 0) {
            throw new AppException("Please provide the image ids to be deleted.")
        }

        const adImages = await prisma.adImages.findMany({
            where: {
                id: {
                    in: adImagesIds
                }
            },
            include: {
                ad: {
                    select: {
                        user_id: true
                    }
                }
            }
        })

        if (adImages.length !== adImagesIds.length) {
            throw new AppException("No matching Images found.", 404);
        }

        for (const adImage of adImages) {
            if (adImage.ad.user_id !== userId) {
                throw new AppException("You don't have permission to delete the images.", 401);
            }
        }

        for (const adImage of adImages) {
            await diskStorage.deleteFile(adImage.path)
        }

        await prisma.adImages.deleteMany({
            where: {
                id: {
                    in: adImagesIds
                }
            }
        })

        return response.status(204).json()
    }
}