import { Request, Response } from "express";

import { prisma } from "../db";

import { DiskManager } from "../services/DiskManager";

export class UserProfilePictureController {
  async create(request: Request, response: Response) {
    const user_id = parseInt(request.user.id);
    const profilePicFilename = request.file?.filename as string;

    const diskManager = new DiskManager();

    const filename = await diskManager.saveFile(profilePicFilename);
    console.log(`User file name: ${filename}`)
    await prisma.users.update({
      where: {
        id: user_id
      },
      data: {
        profile_picture: filename,
        updated_at: new Date()
      }
    })

    return response.status(201).json();
  }
}