import { cloudinary } from '../middleware/multer'
import jwt from 'jsonwebtoken'

import User from '../models/userModels'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import transactione from '../utils/transactions'

const secretKey = process.env.JWT_SECRET as string

const registerUser = async (
  session: mongoose.ClientSession,
  req: Request,
  res: Response
) => {
  const { email, username, password } = req.body

  // Validate input
  if (!email || !username || !password) {
    res.status(400).json({ message: 'Please enter all fields' })
    return
  }

  if (password.length < 8) {
    res
      .status(400)
      .json({ message: 'Password must be at least 8 characters long' })
    return
  }

  let imageURL = ''

  // Handle image upload
  try {
    if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(
        /^data:image\/\w+;base64,/,
        ''
      )
      const buffer = Buffer.from(base64Data, 'base64')

      imageURL = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ upload_preset: 'art-gallery' }, (error, result) => {
            if (result) resolve(result.url)
            else reject(error)
          })
          .end(buffer)
      })
    } else if (req.file) {
      const file = req.file as Express.Multer.File

      imageURL = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ upload_preset: 'art-gallery' }, (error, result) => {
            if (result) resolve(result.url)
            else reject(error)
          })
          .end(file.buffer)
      })
    }
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error })
    console.error('Image upload error:', error)
    return
  }

  try {
    // Create new user
    const newUser = new User({
      email,
      username,
      password,
      image: imageURL
    })

    await newUser.save({ session })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        image: newUser.image
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error })
  }
}

export const loginUser = async (
  session: mongoose.ClientSession,
  req: Request,
  res: Response
) => {
  const { email, password: pass } = req.body
  if (!email || !pass) {
    res.status(400).json({ message: 'Please enter all fields' })
    return
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      res.status(400).json({ message: 'User does not exist' })
      return
    }

    const isMatch = await user.comparePassword(pass)
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' })
      return
    }

    const { password, ...payload } = user.toObject()
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' })
    const refreshToken = jwt.sign(payload, secretKey, { expiresIn: '5h' })

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    })

    user.lastLogin = new Date()
    await user.save({ session })

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        image: user.image
      },
      token
    })
    return
  } catch (error) {
    res.status(500).json({ message: `An error occurred, ${error}` })
    return
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    res.status(401).json({ message: ' RefreshToken does not exist' })
    return
  }

  try {
    const payload = jwt.verify(refreshToken, secretKey) as {
      id: string
      email: string
      username: string
    }

    const newToken = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        username: payload.username
      },
      secretKey,
      { expiresIn: '1h' }
    )

    res.cookie(`refreshCookie`, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    })
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' })
    return
  }
}

export const getUserFn = async (
  session: mongoose.ClientSession,
  req: Request,
  res: Response
) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (user.blockedUsers.includes(req.body.userId)) {
      res.status(403).json({ message: 'User not found' })
      return
    }

    res.json({ user, message: 'User found' })
    return
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error })
    return
  }
}

export const getUsersFn = async (
  session: mongoose.ClientSession,
  req: Request,
  res: Response
) => {
  try {
    const users = await User.find().select('-password')
    res.json({ users, message: 'Users found' })
    return
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error })
    return
  }
}

export const update = async (
  session: mongoose.ClientSession,
  req: Request,
  res: Response
) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    user.username = req.body.username || user.username
    user.email = req.body.email || user.email
    user.isAdmin = req.body.isAdmin || user.isAdmin
    await user.save({ session })

    res.json({ message: 'User updated' })
    return
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error })
    return
  }
}

export const deleter = async (
  session: mongoose.ClientSession,
  req: Request,
  res: Response
) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id, { session })
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json({ message: 'User removed' })
    return
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error })
    return
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('refreshToken', { httpOnly: true })
    res.clearCookie('accessToken', { httpOnly: true })
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to log out', error })
  }
}

export const register = transactione(registerUser)
export const login = transactione(loginUser)
export const getUser = transactione(getUserFn)
export const getUsers = transactione(getUsersFn)
export const updateUser = transactione(update)
export const deleteUser = transactione(deleter)
