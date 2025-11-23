"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoURI = process.env.MONGO_URI;
if (!mongoURI)
    throw new Error("MONGO_URI not defined in environment variables");
const opts = {
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
};
let cached = global.mongooseCache;
if (!cached) {
    cached = global.mongooseCache = {
        conn: null,
        promise: null,
    };
    cached = global.mongooseCache;
}
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (cached.conn)
            return cached.conn;
        if (!cached.promise) {
            cached.promise = mongoose_1.default.connect(mongoURI, opts);
        }
        const conn = yield cached.promise;
        console.log(`MongoDB Connected: ${conn === null || conn === void 0 ? void 0 : conn.connection.host}`);
    }
    catch (err) {
        console.error(`Error: ${err.message} MONGODB`);
        process.exit(1);
    }
});
exports.default = connectDB;
