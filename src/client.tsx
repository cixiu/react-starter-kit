import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import deepForceUpdate from 'react-deep-force-update';
import queryString from 'query-string';
import { Location, Action } from 'history';
import App from './App';
import history from './history';
import { updateMeta } from './DOMUtils';
import router from './routes/router';
import configureStore from './store/configureStore';

interface IWindow extends Window {
  __INITIAL_STATE__: any;
}
declare const window: IWindow;

interface IContext {
  insertCss: (...styles: any[]) => () => void;
  pathname: string;
  query: queryString.OutputParams;
  store: any;
}

const context: IContext = {
  insertCss: (...styles: any[]) => {
    // eslint-disable-next-line no-underscore-dangle
    const removeCss = styles.map(x => x._insertCss());
    return () => {
      removeCss.forEach(f => f());
    };
  },
  pathname: '',
  query: {},
  store: configureStore(window.__INITIAL_STATE__),
};

const container = document.getElementById('app');
let currentLocation = history.location;
let appInstance: any;

const scrollPositionsHistory = {};

// Re-render the app when window.location changes
async function onLocationChange(location: Location, action?: Action) {
  // Remember the latest scroll position for the previous location
  scrollPositionsHistory[currentLocation.key!] = {
    scrollX: window.pageXOffset,
    scrollY: window.pageYOffset,
  };
  // Delete stored scroll position for next page if any
  if (action === 'PUSH') {
    delete scrollPositionsHistory[location.key!];
  }
  currentLocation = location;

  const isInitialRender = !action;
  try {
    context.pathname = location.pathname;
    context.query = queryString.parse(location.search);

    // Traverses the list of routes in the order they are defined until
    // it finds the first route that matches provided URL path string
    // and whose action method returns anything other than `undefined`.
    const route = await router.resolve(context);

    // Prevent multiple page renders during the routing process
    if (currentLocation.key !== location.key) {
      return;
    }

    if (route.redirect) {
      history.replace(route.redirect);
      return;
    }

    const renderReactApp = isInitialRender ? ReactDOM.hydrate : ReactDOM.render;
    appInstance = renderReactApp(
      <Provider store={context.store}>
        <App context={context}>{route.component}</App>
      </Provider>,
      container,
      () => {
        if (isInitialRender) {
          // Switch off the native scroll restoration behavior and handle it manually
          // https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
          if (window.history && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
          }

          const elem = document.getElementById('css');
          if (elem) {
            elem.parentNode!.removeChild(elem);
          }
          return;
        }

        document.title = route.title;

        updateMeta('description', route.description);
        // Update necessary tags in <head> at runtime here, ie:
        // updateMeta('keywords', route.keywords);
        // updateCustomMeta('og:url', route.canonicalUrl);
        // updateCustomMeta('og:image', route.imageUrl);
        // updateLink('canonical', route.canonicalUrl);
        // etc.

        let scrollX = 0;
        let scrollY = 0;
        const pos = scrollPositionsHistory[location.key!];
        if (pos) {
          scrollX = pos.scrollX;
          scrollY = pos.scrollY;
        } else {
          const targetHash = location.hash.substr(1);
          if (targetHash) {
            const target = document.getElementById(targetHash);
            if (target) {
              scrollY = window.pageYOffset + target.getBoundingClientRect().top;
            }
          }
        }

        // Restore the scroll position if it was saved into the state
        // or scroll to the given #hash anchor
        // or scroll to top of the page
        window.scrollTo(scrollX, scrollY);
      },
    );
  } catch (error) {
    if (__DEV__) {
      throw error;
    }

    console.error(error);

    // Do a full page reload if error occurs during client-side navigation
    if (!isInitialRender && currentLocation.key === location.key) {
      console.error('RSK will reload your page after error');
      window.location.reload();
    }
  }
}

// Handle client-side navigation by using HTML5 History API
// For more information visit https://github.com/mjackson/history#readme
history.listen(onLocationChange);
onLocationChange(currentLocation);

declare const module: IHotNodeModule;

// Enable Hot Module Replacement (HMR)
if (module.hot) {
  module.hot.accept('./routes/router', () => {
    if (appInstance && appInstance.updater.isMounted(appInstance)) {
      // Force-update the whole tree, including components that refuse to update
      deepForceUpdate(appInstance);
    }

    onLocationChange(currentLocation);
  });
}
