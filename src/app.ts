import 'express-async-errors';

import swaggerUi from 'swagger-ui-express'
import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import cors from 'cors';

import { routes } from './routes';
import { AppException } from './common/AppException';
import { UPLOADS_FOLDER } from './configs/uploadConfig';

import {createServer} from 'http';
import { Server } from 'socket.io';
import {initializeSocketIO} from './socket'

const app = express();

//Program.cs
app.use(express.json());
app.use(cors({
    origin: '*', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow sending cookies and authentication headers
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
    pingTimeout: 60000,
});

app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`
initializeSocketIO(io);

// io.on('connection', (socket) => {
//     console.log('A user connected: ', socket.id);
//
//     socket.on('disconnect', (reason) => {
//         console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
//     });
//
//     // Example of handling a custom chat event
//     socket.on('join_chat', (chatId) => {
//         console.log(`Message received from ${socket.id} to join chat id: ${chatId}`);
//         // You can emit a response or handle the message here
//     });
// });

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
// Replace this:
// app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));

// With this:
httpServer.listen(PORT, () => console.log(`Server is running on Port ${PORT} along with Socket.IO`));
