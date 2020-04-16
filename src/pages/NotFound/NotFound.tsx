import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import NProgress from 'nprogress';
import { Input } from 'antd';

import classes from './NotFound.less';

interface Props {
  title: string;
}

@withStyles(classes)
class NotFound extends React.PureComponent<Props, {}> {
  componentDidMount(): void {
    console.log('NotFound页面加载完成');
    NProgress.done();
  }

  render(): JSX.Element {
    return (
      <div
        style={{
          height: 3000,
        }}
      >
        <div className={classes.root}>
          <div className={classes.container}>
            <h1 className={classes.title}>{this.props.title}!!</h1>
            <p className={classes.content}>
              Sorry, the page you were trying to view does not exist!!.
            </p>
            <Input />
          </div>
        </div>
      </div>
    );
  }
}

export default NotFound;
