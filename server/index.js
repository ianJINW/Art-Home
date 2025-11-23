"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const passport_1 = __importDefault(require("passport"));
const http_1 = __importDefault(require("http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const artRoutes_1 = __importDefault(require("./routes/artRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const artistRoutes_1 = __importDefault(require("./routes/artistRoutes"));
const chat_1 = require("./socket/chat");
const jwt_1 = require("./utils/jwt");
require("./config/passport");
const app = (0, express_1.default)();
const frontend = process.env.FRONTEND_URL;
const frontend_net = process.env.FRONTEND_URL_NETWORK;
const PORT = process.env.PORT;
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)({
    origin: [frontend, frontend_net],
    credentials: true,
}));
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url} ${JSON.stringify(req.body)} ${req.headers}`);
    next();
});
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.use("/api/v1/user", userRoutes_1.default);
app.use(jwt_1.authToken);
app.use("/api/v1/art", artRoutes_1.default);
app.use("/api/v1/chat", chatRoutes_1.default);
app.use("/api/v1/artist", artistRoutes_1.default);
(0, db_1.default)();
(0, chat_1.initializeSocket)(server);
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
