import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import { connect } from 'react-redux';
import { Button, Progress } from 'antd';

import Link from '@components/Link/Link';
import { changeCount } from '@store/actions/changeCount';

import classes from './Home.less';

interface IProps {
  path: string;
  count: number;
  changeCount: (num: number) => void;
}

@withStyles(classes)
class Home extends React.Component<IProps, {}> {
  minues = () => {
    console.log('minues~~');
    // (this.props as any).dispatch(changeCount(-10));
    this.props.changeCount(-10);
  };

  add = () => {
    console.log('add~~');
    // (this.props as any).dispatch(changeCount(10));
    this.props.changeCount(10);
  };

  render() {
    return (
      <div>
        <div className={classes.header}>当前pathname: {this.props.path}</div>
        <div className={classes.title}>welcome to home</div>
        <Button type="primary">hello!!!</Button>
        <Button type="primary">你好</Button>
        <Button type="primary">你好啊</Button>
        <div>
          <Button type="danger" size="large" onClick={this.minues}>
            -
          </Button>
          <strong style={{ fontSize: 28 }}>{this.props.count}</strong>
          <Button type="primary" size="large" onClick={this.add}>
            +
          </Button>
        </div>

        <Progress percent={99} />
        <Progress percent={10} />

        <Link
          to="/not-found"
          onClick={e => {
            console.log('clicked', e.target);
          }}
        >
          导航一下试试！！
        </Link>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  count: state.count,
});

// const mapDispatchToProps = (dispatch: any) => {
//   return {
//     changeCount: (num: number) => dispatch(changeCount(num))
//   }
// }

const mapDispatchToProps = { changeCount };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Home);
