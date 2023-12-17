import {hash} from "bcryptjs";
import {NextFunction, Request, Response} from "express";

import {AppException} from "../common/AppException";
import {prisma} from "../db";
import {DiskManager} from "../services/DiskManager";
import {Console} from "inspector";
import {parse} from "url";

export class UsersController {
    async show(request: Request, response: Response) {
        const userId : number = parseInt(request.user.id);

        const user = await prisma.users.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                profile_picture: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true
            }
        })

        if (!user) {
            throw new AppException('User not found.', 404)
        }

        return response.json(user)
    }

    async create(request: Request, response: Response, next: NextFunction) {
        console.log('Got here\n');
        const {first_name, last_name, email, password, phone} = request.body;
        const profilePicFile = request.file;
        const diskManager = new DiskManager();

        if (!profilePicFile) {
            throw new AppException("Can't proceed without Image.")
        }

        if (!first_name || !last_name || !email || !password || !phone) {
            await diskManager.deleteFile(profilePicFile.path)
            throw new AppException("Missing text fields");
        }

        const checkUserEmailExists = await prisma.users.findUnique({
            where: {
                email
            }
        })

        if (checkUserEmailExists) {
            await diskManager.deleteFile(profilePicFile.path)
            throw new AppException("Email already exists.", 401);
        }

        const checkUserTelExists = await prisma.users.findUnique({
            where: {
                phone
            }
        })

        if (checkUserTelExists) {
            await diskManager.deleteFile(profilePicFile.path)
            throw new AppException("Phone Number already exists.", 401);
        }

        const hashedPassword = await hash(password, 8);

        const user = await prisma.users.create({
            data: {
                first_name,
                last_name,
                email,
                phone,
                password: hashedPassword
            }
        });

        request.user = {
            id: String(user.id),
        };

        return next();
    }

    async update(request: Request, response: Response) {
        const profilePicFile = request.file;
        const diskManager = new DiskManager();

        const userId : number = parseInt(request.user.id);
        const requestId : number = parseInt(request.params.id)

        if(userId !== requestId) {
            if (profilePicFile) {
                await diskManager.deleteFile(profilePicFile.path)
            }
            throw new AppException("User authentication failed!");
        }

        const {
            first_name,
            last_name,
            phone_number,
            default_address
        } = request.body

        console.log(userId, first_name, last_name)
        if (!first_name || !last_name || !phone_number || !default_address) {
            if (profilePicFile) {
                await diskManager.deleteFile(profilePicFile.path)
            }
            throw new AppException("Missing text fields");
        }

        const user = await prisma.users.findUnique({
            where: {
                id: userId
            }
        })

        if (!user || !user.profile_picture) {
            if (profilePicFile) {
                await diskManager.deleteFile(profilePicFile.path)
            }
            throw new AppException("User not found.", 404)
        }

        await diskManager.deleteFile(user.profile_picture)

        const user_address: number[] = default_address.split(",").map(parseFloat);

        if(user_address.length !== 2) {
            if (profilePicFile) {
                await diskManager.deleteFile(profilePicFile.path)
            }
            throw new AppException("Invalid address.", 404)
        }

        let address = await prisma.locations.findFirst({
            where: {
                longitude: user_address[0],
                latitude: user_address[1],
            },
        })

        if (!address) {
            address = await prisma.locations.create({
                data: {
                    longitude: user_address[0],
                    latitude: user_address[1],
                    address_text: "Default address",
                }
            })
        }

        user.first_name = first_name
        user.last_name = last_name
        user.phone = phone_number
        user.address_id = address.id
        if(profilePicFile) {
            user.profile_picture = profilePicFile.filename
        }

        console.log(user)
        await prisma.users.update({
            where: {
                id: userId
            },
            data: {
                ...user
            }
        })
        const { password: removeField, ...rest } = user;

        console.log({...rest})
        return response.status(200).json({ user: {...rest}});
    }

    async getUser(request: Request, response: Response) {
        const userId = Number(request.params.id);
        const currentUserId = parseInt(request.user.id)

        const userDetails = await prisma.users.findUnique({
            where: {
                id: userId
            },
            select: {
                profile_picture: true,
                first_name: true,
                last_name: true,
            }
        })

        const adsTemp = await prisma.ads.findMany({
            where: {
                user_id: userId,
                is_active: true,
            },
            include: {
                ad_images: {
                    select: {
                        path: true,
                        name: true,
                    }
                },
                category: {
                    select: {
                        name: true
                    }
                },
                location: {
                    select: {
                        longitude: true,
                        latitude: true
                    }
                },
                in_user_favorite_ads: {
                    where: {
                        user_id: currentUserId // Filter by the current user's ID
                    },
                    select: {
                        user_id: true
                    }
                }
            }
        });

        const modifiedAds = adsTemp.map(ad => {
            const is_users_favorite = ad.in_user_favorite_ads.length > 0; // Check if the ad is in user's favorites
            return {
                ...ad,
                is_users_favorite
            };
        });

        const favoritesCountPromises = adsTemp.map(async ad => {
            return prisma.userFavoriteAds.count({
                where: {
                    ad_id: ad.id
                }
            });
        });

        const bidsCountPromises = adsTemp.map(async ad => {
            return prisma.userAdsBids.count({
                where: {
                    ad_id: ad.id
                }
            });
        });

        const favoritesCount = await Promise.all(favoritesCountPromises);
        const bidsCount = await Promise.all(bidsCountPromises);

        const ads = modifiedAds.map((ad, index) => ({
            ...ad,
            favorites_count: favoritesCount[index], // Assign the favorites count to each ad,
            bids_count: bidsCount[index]
        }));

        const result = {user: userDetails, ads: ads}
        console.log(result)
        return response.status(200).json(result)
    }
}
