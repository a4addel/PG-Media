"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express_1 = __importDefault(require("express"));
const App = (0, express_1.default)();
const http_1 = __importDefault(require("http"));
const Server = new http_1.default.Server(App);
const path_1 = __importDefault(require("path"));
const io = require("socket.io")(Server, {
    origin: process.env.NODE_ENV === "production"
        ? JSON.stringify(process.env.ORIGIN)
        : "*",
});
module.exports.io = io;
const PORT = process.env.NODE_ENV === "production" ? process.env.PORT : 5000;
const cors_1 = __importDefault(require("cors")); // Manage allowed Request);
const compression_1 = __importDefault(require("compression"));
App.use(express_1.default.static(path_1.default.resolve(__dirname, "public")));
App.set("io", io);
App.use(express_1.default.json());
App.use(express_1.default.urlencoded({ extended: false }));
App.use((0, cors_1.default)({
    origin: "*"
}));
App.use((0, compression_1.default)());
const Routes_1 = __importDefault(require("./Apis/v1/Users/Routes"));
const Routes_2 = __importDefault(require("./Apis/v1/Posts/Routes"));
const Routes_3 = __importDefault(require("./Apis/v1/Comment/Routes"));
const Routes_4 = __importDefault(require("./Apis/v1/Replys/Routes"));
const Routes_5 = __importDefault(require("./Apis/v1/Chat/Routes"));
const Routes_6 = __importDefault(require("./Apis/v1/Messeges/Routes"));
App.use("/users", Routes_1.default);
App.use("/posts", Routes_2.default);
App.use("/comments", Routes_3.default);
App.use("/replies", Routes_4.default);
App.use("/chat", Routes_5.default);
App.use("/messages", Routes_6.default);
/**
 * Catch errors from Routes
 */
App.use((err, _req, res, _next) => {
    res.status(404);
    res.send(err.message || "not found");
    res.end();
    return;
});
const jsonwebtoken_1 = require("jsonwebtoken");
io.on("connection", function (socket) {
    if (!socket.handshake.headers.auth || !socket.handshake.headers.chat_id) {
        return;
    }
    const TOKEN = socket.handshake.headers.auth.split(" ")[1];
    if (TOKEN.length < 2) {
        return;
    }
    const CHAT_ID = socket.handshake.headers.chat_id;
    let decoded = (0, jsonwebtoken_1.verify)(TOKEN, process.env.JWT_SECRET || "") || { id: null, username: null };
    if (CHAT_ID.search(decoded.id)) {
        return;
    }
    else {
        socket.join(CHAT_ID);
    }
});
Server.listen(PORT, () => {
    console.log(`Running ${process.env.NODE_ENV === "production" ? "Production" : "Development"} on port ${PORT} Baby!`);
});