import {Request, Response} from "express";

import {prisma} from "../db";

export class UserAdsController {
  async index(request: Request, response: Response) {
    const userId: number = parseInt(request.user.id);

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
        },
        in_user_favorite_ads: {
          where: {
            user_id: userId // Filter by the current user's ID
          },
          select: {
            user_id: true
          }
        }
      }
    });

    const modifiedAds = ads.map(ad => {
      const is_users_favorite = ad.in_user_favorite_ads.length > 0; // Check if the ad is in user's favorites
      return {
        ...ad,
        is_users_favorite
      };
    });

    const favoritesCountPromises = ads.map(async ad => {
      return prisma.userFavoriteAds.count({
        where: {
          ad_id: ad.id
        }
      });
    });

    const bidsCountPromises = ads.map(async ad => {
      return prisma.userAdsBids.count({
        where: {
          ad_id: ad.id
        }
      });
    });

    const favoritesCount = await Promise.all(favoritesCountPromises);
    const bidsCount = await Promise.all(bidsCountPromises);

    const adsWithFavoritesCount = modifiedAds.map((ad, index) => ({
      ...ad,
      favorites_count: favoritesCount[index], // Assign the favorites count to each ad,
      bids_count: bidsCount[index]
    }));

    console.log(adsWithFavoritesCount);
    return response.json(adsWithFavoritesCount);
  }

}
