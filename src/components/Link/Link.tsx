import React from 'react';
import history from '../../history';

function isLeftClickEvent(event: React.MouseEvent): boolean {
  return event.button === 0;
}

function isModifiedEvent(event: React.MouseEvent): boolean {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

interface Props {
  to: string;
  children: React.ReactNode;
  onClick: (event: React.MouseEvent) => void;
}

class Link extends React.Component<Props, {}> {
  static defaultProps = {
    onClick: null,
  };

  handleClick = (event: React.MouseEvent): void => {
    if (this.props.onClick) {
      console.log(event.target);
      this.props.onClick(event);
    }

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
      return;
    }

    if (event.defaultPrevented === true) {
      return;
    }

    event.preventDefault();
    history.push(this.props.to);
  };

  render(): JSX.Element {
    const { to, children, ...props } = this.props;
    return (
      <a href={to} {...props} onClick={this.handleClick}>
        {children}
      </a>
    );
  }
}

export default Link;
