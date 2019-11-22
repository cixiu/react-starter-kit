import React from 'react';
import serialize from 'serialize-javascript';
import { ActionReturn } from '@routes/routes';

// interface Props {
//   title: string;
//   description: string;
//   styles: Array<{
//     id: string;
//     cssText: string;
//   }>;
//   scripts: string[];
//   app: { state: object };
//   children: string;
// }

export interface HtmlProps extends ActionReturn {
  styles: Array<{
    id: string;
    cssText: string;
  }>;
  scripts: string[];
  app: { state: object };
  children: string;
}

class Html extends React.Component<HtmlProps, {}> {
  static defaultProps = {
    styles: [],
    scripts: [],
    app: { state: {} },
  };

  render(): JSX.Element {
    const { title, description, styles, scripts, app, children } = this.props;
    return (
      <html className="no-js" lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {scripts.map(script => {
            if (/\.css$/.test(script)) {
              return (
                <link
                  key={script}
                  rel="stylesheet"
                  type="text/css"
                  href={script}
                />
              );
            }
            return (
              <link key={script} rel="preload" href={script} as="script" />
            );
          })}
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="apple-touch-icon" href="/icon.png" />
          {styles.map(style => (
            <style
              key={style.id}
              id={style.id}
              dangerouslySetInnerHTML={{ __html: style.cssText }}
            />
          ))}
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__INITIAL_STATE__=${serialize(app.state)}`,
            }}
          />
          {scripts.map(script => {
            if (/\.css$/.test(script)) {
              return null;
            }
            return <script key={script} src={script} />;
          })}
        </body>
      </html>
    );
  }
}

export default Html;
