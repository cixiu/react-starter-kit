import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

export const secret =
  process.env.SECRET ?? 'hfkshgsjgf42493274305jkd-043[657]435';
export const cookieKey = process.env.COOKIE_KEY ?? 'id_token';

const expiresIn = 60 * 60 * 24 * 180; // 180 days

router.post('/', (req, res, next) => {
  const user = {
    name: 'cixiu',
    age: 20,
  };
  const token = jwt.sign(
    {
      data: user,
    },
    secret,
    {
      expiresIn,
    },
  );
  const cookieValue = Buffer.from(token).toString('base64');

  res.cookie(cookieKey, cookieValue, {
    maxAge: 1000 * expiresIn,
    httpOnly: true,
  });
  res.json(user);
});

export default router;
