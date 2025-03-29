import { Request, Response } from "express";
import Post from "../models/postModel";

export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find().populate("user", "-password");
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts" });
    }
}

export const createPost = async (req: Request, res: Response) => {
    const { title, description, image, user } = req.body;
   

    try {
        const newPost = new Post({
            title,
            description,
            image,
            user,
        });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: "Error creating post" });
    }
}

