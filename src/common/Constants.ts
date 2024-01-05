export const ChatEventEnum = Object.freeze({
    // ? once user is ready to go
    CONNECT_EVENT: "connect",
    CONNECTED_EVENT: "connected",
    // ? when user gets disconnected
    DISCONNECT_EVENT: "disconnect",
    // ? when user joins a socket room
    JOIN_CHAT_EVENT: "joinChat",
    // ? when participant gets removed from group, chat gets deleted or leaves a group
    LEAVE_CHAT_EVENT: "leaveChat",
    // ? when new message is received
    MESSAGE_RECEIVED_EVENT: "messageReceived",
    // ? when there is an error in socket
    SOCKET_ERROR_EVENT: "socketError",
    // ? when participant stops typing
    STOP_TYPING_EVENT: "stopTyping",
    // ? when participant starts typing
    TYPING_EVENT: "typing",
    // ? When a new message is received in any chat
    CHAT_MESSAGE_RECEIVED_EVENT: "chatMessage",
});

export const AvailableChatEvents = Object.values(ChatEventEnum);