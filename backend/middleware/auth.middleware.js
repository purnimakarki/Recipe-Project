import jwt from 'jsonwebtoken';
import asyncHandler from './asynchandler.middleware.js';
import User from '../models/user.model.js';

const checkAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    let err = new Error("You must be logged in!");
    err.status = 401;
    throw err;
  }

  const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
  console.log(token)
  
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
   
    const userDetail = await User.findById(userId).select('-password');
    req.user = userDetail;
    next();
  } catch (e) {
    let err = new Error("Invalid Token!");
    err.status = 401;
    throw err;
  }
});

const checkAdmin = asyncHandler(async (req, res, next) => {
  const { isAdmin } = req.user;
  if (isAdmin) next();
  else {
    let err = new Error("You are not authorized to perform this operation");
    err.status = 403;
    throw err;
  }
});

export { checkAuth, checkAdmin };