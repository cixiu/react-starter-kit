import React from 'react';
import { Input } from 'antd';
import useStyles from 'isomorphic-style-loader/useStyles';

import classes from './index.less';
// interface AProps {}

const A: React.FC = () => {
  useStyles(classes);
  return (
    <div>
      <div className={classes.headerTitle}>这是A组件</div>
      <Input placeholder="Basic usage"></Input>
      <Input placeholder="Basic usage"></Input>
    </div>
  );
};

export default A;
