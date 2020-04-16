import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Progress } from 'antd';
import { PlusCircleFilled, MinusCircleFilled } from '@ant-design/icons';

import NProgress from 'nprogress';
import useStyles from 'isomorphic-style-loader/useStyles';
import { StoreState } from '@store/reducers';

import Link from '@components/Link/Link';
import { changeCount } from '@store/actions/changeCount';
import { postLogin } from '@store/actions/userInfo';
import A from '@components/A/A';

import classes from './Home.less';

interface Props {
  path: string;
}

const Home = (props: Props): JSX.Element => {
  useStyles(classes);
  const count = useSelector((state: StoreState) => state.count);
  const userInfo = useSelector((state: StoreState) => state.userInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('home页面加载完成');
    NProgress.done();
  }, []);

  const minues = (): void => {
    console.log('minues~~');
    dispatch(changeCount(-10));
  };

  const add = (): void => {
    console.log('add~~');
    dispatch(changeCount(10));
  };

  const login = async (): Promise<void> => {
    // const res = await axios.post('/proxy/login');
    // dispatch(addUserInfo(res.data));
    await dispatch(
      postLogin({
        username: '这是一个用户',
        password: '123456',
      }),
    );
  };

  return (
    <div
      style={{
        height: 2000,
      }}
    >
      <A></A>
      <div className={classes.header}>当前pathname: {props.path}</div>
      <div className={classes.title}>welcome to home</div>
      <Button type="primary">hello</Button>
      <Button type="primary">你好</Button>
      <Button type="primary">你好啊</Button>
      <div>
        <MinusCircleFilled
          style={{
            fontSize: 28,
          }}
          onClick={minues}
        />
        <strong style={{ fontSize: 28 }}>{count}</strong>
        <PlusCircleFilled
          style={{
            fontSize: 28,
          }}
          onClick={add}
        />
      </div>

      <Progress percent={99} />
      <Progress percent={10} />

      <Link to="/not-found">导航一下试试！！!</Link>
      {userInfo.username ? (
        <div>
          <p>您已登录</p>
          <p>用户名： {userInfo.username}</p>
        </div>
      ) : (
        <Button type="primary" className={classes.loginBtn} onClick={login}>
          登录
        </Button>
      )}
    </div>
  );
};

export default Home;
