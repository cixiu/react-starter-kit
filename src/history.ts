import { createBrowserHistory, History } from 'history';
// import createBrowserHistory from 'history/createBrowserHistory';

// Navigation manager, e.g. history.push('/home')
// https://github.com/mjackson/history
// eslint-disable-next-line import/no-mutable-exports
let history!: History;

if (process.env.BROWSER) {
  history = createBrowserHistory();
}

export default history;
