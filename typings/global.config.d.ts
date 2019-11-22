// eslint-disable-next-line spaced-comment
/// <reference types="node" />

declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

// eslint-disable-next-line no-underscore-dangle
declare const __DEV__: boolean;

interface THot {
  accept(dependencies: string | string[], callback?: () => void): void;
  accept(callback?: () => void): void;
  decline(dependencies?: string | string[]): void;
}

interface THotNodeModule extends NodeModule {
  hot?: THot;
}
