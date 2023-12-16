import 'express-async-errors';

import swaggerUi from 'swagger-ui-express'
import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import cors from 'cors';

import { routes } from './routes';
import { AppException } from './common/AppException';
import { UPLOADS_FOLDER } from './configs/uploadConfig';

});

const PORT = 2339;
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));