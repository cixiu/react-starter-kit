import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = express.Router();

export const secret =
  process.env.SECRET ?? 'hfkshgsjgf42493274305jkd-043[657]435';
export const cookieKey = process.env.COOKIE_KEY ?? 'id_token';

const expiresIn = 60 * 60 * 24 * 180; // 180 days

router.post('/', async (req, res, next) => {
  const url = `https://www.tzpcc.cn/api/user/info`;
  const data = req.body;
  try {
    console.log(data);
    const response = await axios.get(url, {
      params: {
        user_id: data.user_id,
      },
    });
    // console.log(response);
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
      console.log(token);
      const cookieValue = Buffer.from(token).toString('base64');

      res.cookie(cookieKey, cookieValue, {
        maxAge: 1000 * expiresIn,
        httpOnly: true,
      });
      console.log(response.data);
      res.json(response.data);
    }
  } catch (err) {
    console.log(err);
  }
});

export default router;
