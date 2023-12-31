import {Request, Response} from "express";
import {AppException} from "../common/AppException";
import {prisma} from "../db";

export class UserFeedbackController {
    async create(request: Request, response: Response) {
        const reviewerId = parseInt(request.user.id);
        const rating = Number(request.body.rating);
        const review = String(request.body.review);
        const receiverid = parseInt(request.body.receiverid)

        console.log("Inside controller", reviewerId)
        console.log("Inside controller", rating)
        console.log("Inside controller", review)
        console.log("Inside controller", receiverid)

        //if rating null
        if(!rating) {
            throw new AppException("Set your Rating First")
        }

        if(!review) {
            throw new AppException("Review is Invalid")
        }

        if(!receiverid) {
            throw new AppException("Select the user to which you want to send review")
        }

        // TODO : verify that user is able to review

        //table name + database functions
        const reviewInfo = await prisma.reviews.create({

            //table columns
            data: {
                comment: review,
                stars: rating,
                user_id: receiverid,
                reviewer_user_id: reviewerId,
                created_at: new Date()
            }
        })

        return response.status(204).json();
    }

    async show(request: Request, response: Response){
        const userId = parseInt(request.params.id);
        console.log(userId)
        const UserFeedback = await prisma.reviews.findMany({
            where: {
                user_id: userId
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        profile_picture: true,
                    }
                }
            }
        })
        console.log("Feedback  ", UserFeedback)
        if(!UserFeedback){
            return response.status(200).json([])
        }
        return response.status(200).json(UserFeedback)
    }

}
