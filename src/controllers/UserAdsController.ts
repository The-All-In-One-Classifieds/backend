import { Request, Response } from "express";

import { prisma } from "../db";

export class UserAdsController {
  async index(request: Request, response: Response) {
    const userId : number = parseInt(request.user.id);

    const ads = await prisma.ads.findMany({
      where: {
        user_id: userId
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
        }
      }
    })

    console.log(ads)
    return response.json(ads);
  }
}