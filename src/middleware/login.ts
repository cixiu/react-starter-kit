import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import logger from '@config/index';

const router = express.Router();

export const secret =
  process.env.SECRET ?? 'hfkshgsjgf42493274305jkd-043[657]435';
export const cookieKey = process.env.COOKIE_KEY ?? 'id_token';

const expiresIn = 60 * 60 * 24 * 180; // 180 days

router.post('/', async (req, res, next) => {
  const url = `http://94.191.82.146:9004/user/login`;
  const data = req.body;
  try {
    const response = await axios.post(url, data);
    if (response.data.code === 0) {
      const userId: string = response.data.data.id.toString();
      const token = jwt.sign(
        {
          data: {
            userId,
          },
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
    }
    res.json(response.data);
  } catch (err) {
    logger.error(`登录请求出错了, message: ${err.message}`);
    res.status(500).send({
      code: 1,
      message: '出错啦',
    });
  }
});

export default router;
