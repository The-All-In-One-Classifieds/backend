import multer from "multer";
import crypto from "crypto";
import path from "path";

const STORAGE_FOLDER = path.resolve(__dirname, "..", "..", "storage");
const UPLOADS_FOLDER = path.resolve(STORAGE_FOLDER, "uploads");

const MULTER = {
    storage: multer.diskStorage({
        destination: STORAGE_FOLDER,
        filename(request, file, callback) {
            const fileHash = crypto.randomBytes(12).toString("hex");
            const fileName = `${fileHash}-${file.originalname}`;

            return callback(null, fileName);
        },
    }),
};

export {
    STORAGE_FOLDER,
    UPLOADS_FOLDER,
    MULTER
}