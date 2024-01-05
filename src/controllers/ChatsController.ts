import {Request, Response} from "express";
import {prisma} from "../db";
import {AppException} from "../common/AppException";

export class ChatsController{
    async getAllUserChats(request: Request, response: Response) {
        const userId = parseInt(request.user.id)
        const chats =  await prisma.chats.findMany({
            where: {
                OR: [
                    { member_one_id: userId },
                    { member_two_id: userId }
                ]
            },
            select: {
                id: true,
                ad_id: true,
                member_one: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        profile_picture: true
                    }
                },
                member_two: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        profile_picture: true
                    }
                },
                messages: {
                    select: {
                        sender_id: true,
                        is_seen: true,
                    },
                    orderBy: {
                        created_at: "desc"
                    },
                    take: 1
                },
                last_message: true,
                updated_at: true,
            },
            orderBy: {
              updated_at: "desc"
            }
        });

        return response.status(200).json(chats);
    }
}
