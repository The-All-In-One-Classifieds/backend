import {Request, Response} from "express";
import {prisma} from "../db";

export class ChatsController{
    async getAllUserChats(request: Request, response: Response) {
        const userId = parseInt(request.user.id)

        const chats = prisma.chats.findMany({
            where: {
                OR: [
                    { member_one_id: userId },
                    { member_two_id: userId }
                ]
            },
            select: {
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
                        receiver_id: true,
                        is_seen: true,
                    },
                    orderBy: {
                        created_at: "desc"
                    },
                    take: 1
                },
                last_message: true,
                updated_at: true,
            }
        });

        console.log("All Chats:\n", chats);
        return response.status(200).json(chats);
    }
}
