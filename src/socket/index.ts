import {Server, Socket} from "socket.io";
import {verify} from "jsonwebtoken";
import {authConfig} from "../configs/authConfig";
import {AppException} from "../common/AppException";
import {prisma} from "../db";
import {ChatEventEnum} from "../common/Constants";
import {DefaultEventsMap} from "socket.io/dist/typed-events";

const socketUserMap = new Map<string, any>();

export function initializeSocketIO(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    return io.on("connection", async (socket) => {
        try {
            // Extract the token from the connection query or auth object
            const token = socket.handshake.query.token || socket.handshake.auth.token;
            let userId: number
            try {
                const {sub: user_id} = verify(token, authConfig.jwt.secret);

                if (typeof user_id !== 'string') {
                    throw new AppException("JWT token verification failed!", 401)
                }

                userId = parseInt(user_id)
            } catch {
                throw new AppException("token.invalid", 401);
            }

            const user = await prisma.users.findUnique({
                where: {
                    id: userId
                }
            })

            if (!user) {
                throw new AppException("Un-authorized handshake. Token is invalid");
            }
            // Store the user in the map using socket ID
            socketUserMap.set(socket.id, user);

            // We are creating a room with user id so that if user is joined but does not have any active chat going on.
            // still we want to emit some socket events to the user.
            // so that the client can catch the event and show the notifications.
            socket.join(user.id.toString());
            socket.emit(ChatEventEnum.CONNECTED_EVENT); // emit the connected event so that client is aware
            console.log("User connected 🗼. userId: ", user.id.toString());

            // Common events that needs to be mounted on the initialization
            mountJoinChatEvent(socket);
            mountParticipantTypingEvent(socket);
            mountParticipantStoppedTypingEvent(socket);

            socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
                console.log("user has disconnected 🚫. userId: " + socketUserMap.get(socket.id)?.id);
                const userId = socketUserMap.get(socket.id)?.id;
                if (userId) {
                    socket.leave(userId.toString());
                    // Remove the user from the map
                    socketUserMap.delete(socket.id);
                }
            });
        } catch (error : any) {
            socket.emit(
                ChatEventEnum.SOCKET_ERROR_EVENT,
                error?.message || "Something went wrong while connecting to the socket."
            );
        }
    });
}

/**
 * @description This function is responsible to allow user to join the chat represented by chatId (chatId). event happens when user switches between the chats
 * @param {Socket<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>} socket
 */
const mountJoinChatEvent = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
        console.log(`User joined the chat 🤝. chatId: `, chatId);
        // joining the room with the chatId will allow specific events to be fired where we don't bother about the users like typing events
        // E.g. When user types we don't want to emit that event to specific participant.
        // We want to just emit that to the chat where the typing is happening
        socket.join(chatId);
    });
};

/**
 * @description This function is responsible to emit the typing event to the other participants of the chat
 * @param {Socket<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>} socket
 */
const mountParticipantTypingEvent = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
    });
};

/**
 * @description This function is responsible to emit the stopped typing event to the other participants of the chat
 * @param {Socket<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>} socket
 */
const mountParticipantStoppedTypingEvent = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
        socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
    });
};

export const emitSocketEvent = (req, roomId, event, payload) => {
    req.app.get("io").in(roomId).emit(event, payload);
};
