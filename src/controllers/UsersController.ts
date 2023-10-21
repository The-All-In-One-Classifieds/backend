import {hash} from "bcryptjs";
import {NextFunction, Request, Response} from "express";

import {AppException} from "../common/AppException";
import {prisma} from "../db";
import {DiskManager} from "../services/DiskManager";
import {Console} from "inspector";

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
}