

import jwt from 'jsonwebtoken';

const createToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET,
    );

  // Optional: Set token in the response header (or use cookies if you want)
  res.setHeader('Authorization', `Bearer ${token}`);
  return token;
};

export default createToken;
