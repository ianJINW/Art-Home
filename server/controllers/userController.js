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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUsers = exports.getUser = exports.login = exports.register = exports.logout = exports.deleter = exports.update = exports.getUsersFn = exports.getUserFn = exports.refreshToken = exports.loginUser = void 0;
const multer_1 = require("../middleware/multer");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModels_1 = __importDefault(require("../models/userModels"));
const transactions_1 = __importDefault(require("../utils/transactions"));
const secretKey = process.env.JWT_SECRET;
const registerUser = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password } = req.body;
    // Validate input
    if (!email || !username || !password) {
        res.status(400).json({ message: 'Please enter all fields' });
        return;
    }
    if (password.length < 8) {
        res
            .status(400)
            .json({ message: 'Password must be at least 8 characters long' });
        return;
    }
    let imageURL = '';
    // Handle image upload
    try {
        if (req.body.imageBase64) {
            const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            imageURL = yield new Promise((resolve, reject) => {
                multer_1.cloudinary.uploader
                    .upload_stream({ upload_preset: 'art-gallery' }, (error, result) => {
                    if (result)
                        resolve(result.url);
                    else
                        reject(error);
                })
                    .end(buffer);
            });
        }
        else if (req.file) {
            const file = req.file;
            imageURL = yield new Promise((resolve, reject) => {
                multer_1.cloudinary.uploader
                    .upload_stream({ upload_preset: 'art-gallery' }, (error, result) => {
                    if (result)
                        resolve(result.url);
                    else
                        reject(error);
                })
                    .end(file.buffer);
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Image upload failed', error });
        console.error('Image upload error:', error);
        return;
    }
    try {
        // Create new user
        const newUser = new userModels_1.default({
            email,
            username,
            password,
            image: imageURL
        });
        yield newUser.save({ session });
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                image: newUser.image
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
});
const loginUser = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password: pass } = req.body;
    if (!email || !pass) {
        res.status(400).json({ message: 'Please enter all fields' });
        return;
    }
    try {
        const user = yield userModels_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'User does not exist' });
            return;
        }
        const isMatch = yield user.comparePassword(pass);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const _a = user.toObject(), { password } = _a, payload = __rest(_a, ["password"]);
        const token = jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: '5h' });
        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });
        user.lastLogin = new Date();
        yield user.save({ session });
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                image: user.image
            },
            token
        });
        return;
    }
    catch (error) {
        res.status(500).json({ message: `An error occurred, ${error}` });
        return;
    }
});
exports.loginUser = loginUser;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ message: ' RefreshToken does not exist' });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, secretKey);
        const newToken = jsonwebtoken_1.default.sign({
            id: payload.id,
            email: payload.email,
            username: payload.username
        }, secretKey, { expiresIn: '1h' });
        res.cookie(`refreshCookie`, newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
    }
});
exports.refreshToken = refreshToken;
const getUserFn = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModels_1.default.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.blockedUsers.includes(req.body.userId)) {
            res.status(403).json({ message: 'User not found' });
            return;
        }
        res.json({ user, message: 'User found' });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
        return;
    }
});
exports.getUserFn = getUserFn;
const getUsersFn = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModels_1.default.find().select('-password');
        res.json({ users, message: 'Users found' });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
        return;
    }
});
exports.getUsersFn = getUsersFn;
const update = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModels_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin || user.isAdmin;
        yield user.save({ session });
        res.json({ message: 'User updated' });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
        return;
    }
});
exports.update = update;
const deleter = (session, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModels_1.default.findByIdAndDelete(req.params.id, { session });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User removed' });
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
        return;
    }
});
exports.deleter = deleter;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie('refreshToken', { httpOnly: true });
        res.clearCookie('accessToken', { httpOnly: true });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to log out', error });
    }
});
exports.logout = logout;
exports.register = (0, transactions_1.default)(registerUser);
exports.login = (0, transactions_1.default)(exports.loginUser);
exports.getUser = (0, transactions_1.default)(exports.getUserFn);
exports.getUsers = (0, transactions_1.default)(exports.getUsersFn);
exports.updateUser = (0, transactions_1.default)(exports.update);
exports.deleteUser = (0, transactions_1.default)(exports.deleter);
