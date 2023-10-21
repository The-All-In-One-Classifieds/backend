import fs from "fs";
import path from "path";
import { STORAGE_FOLDER, UPLOADS_FOLDER } from "../configs/uploadConfig";

export class DiskManager {
  async saveFile(file: string) {

    await fs.promises.rename(
      path.resolve(STORAGE_FOLDER, file),
      path.resolve(UPLOADS_FOLDER, file),
    );

    return file;
  }

  async deleteFile(file: string) {
    const filePath = path.resolve(UPLOADS_FOLDER, file);

    try {
      await fs.promises.stat(filePath);
    } catch {
      return;
    }

    await fs.promises.unlink(filePath);
  }
}