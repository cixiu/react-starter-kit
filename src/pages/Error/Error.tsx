import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';
import classes from './Error.less';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

class ErrorPage extends React.Component<Props, {}> {
  static defaultProps = {
    error: null,
  };

  render(): JSX.Element {
    if (__DEV__ && this.props.error) {
      return (
        <div>
          <h1>{this.props.error.name}</h1>
          <pre>{this.props.error.stack}</pre>
        </div>
      );
    }

    return (
      <div>
        <h1>Error</h1>
        <p>Sorry, a critical error occurred on this page.</p>
      </div>
    );
  }
}

export { ErrorPage as ErrorPageWithoutStyle };
export default withStyles(classes)(ErrorPage);
