import 'express-async-errors';

import swaggerUi from 'swagger-ui-express'
import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import cors from 'cors';

import { routes } from './routes';
import { AppException } from './common/AppException';
import { UPLOADS_FOLDER } from './configs/uploadConfig';

import http from 'http';
import { Server } from 'socket.io';

const app = express();

//Program.cs
app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    // Socket.IO options here
});

console.log("Server Starting...");
io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
    });

    // Example of handling a custom chat event
    socket.on('chat message', (msg) => {
        console.log(`Message received from ${socket.id}: ${msg}`);
        io.emit('chat message', "Hi")
        // You can emit a response or handle the message here
    });
});


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
