import {Request, Response} from "express";
import {AppException} from "../common/AppException";
import {prisma} from "../db";

export class FeedbackController {
    async create(request: Request, response: Response) {
        const UserId = parseInt(request.user.id);
        const rating = Number(request.body.rating);
        const review = String(request.body.review);

        //if rating null
        if(!rating) {
            throw new AppException("Set your Rating First")
        }

        if(!review) {
            throw new AppException("Review is Invalid")
        }

        //table name + database functions
        const reviewInfo = await prisma.appReviews.create({

            //table columns
            data: {
                review: review,
                stars: rating,
                user_id: UserId
            }
        })

        return response.status(204).json();
    }

    async show(request: Request, response: Response){
        const userId = parseInt(request.user.id);
        const appReview = await prisma.appReviews.findFirst({
            where: {
                user_id: userId
            },
        })

        if(!appReview){
            return response.status(200).json({})
        }
        return response.status(200).json(appReview)
    }

}