import { Request, Response } from "express";

import { prisma } from "../db";

export class UserAdsController {
  async index(request: Request, response: Response) {
    const userId : number = parseInt(request.user.id);

    const ads = await prisma.ads.findMany({
      where: {
        id: userId
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
        }
      }
    })

    return response.json(ads);
  }
}