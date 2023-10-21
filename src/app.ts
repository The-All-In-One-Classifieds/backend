import 'express-async-errors';

import swaggerUi from 'swagger-ui-express'
import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import cors from 'cors';

import { routes } from './routes';
import { AppException } from './common/AppException';
import { UPLOADS_FOLDER } from './configs/uploadConfig';

const app = express();

app.use(express.json());
app.use(cors());

app.use("/images", express.static(UPLOADS_FOLDER));

app.use(routes)
app.use((err: { statusCode: number; message: any; }, request: Request, response: Response, next: NextFunction) => {
    if (err instanceof AppException) {
        return response.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
    }

    console.log(err);

    return response.status(500).json({
        status: "error",
        message: "Internal server error",
    });
});

const PORT = 2339;
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));