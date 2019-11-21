import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import classes from './NotFound.less';

interface IProps {
  title: string;
}

@withStyles(classes)
class NotFound extends React.PureComponent<IProps, {}> {
  render() {
    return (
      <div className={classes.root}>
        <div className={classes.container}>
          <h1 className={classes.title}>{this.props.title}</h1>
          <p className={classes.content}>
            Sorry, the page you were trying to view does not exist.
          </p>
        </div>
      </div>
    );
  }
}

export default NotFound;
