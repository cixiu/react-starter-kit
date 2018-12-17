/// <reference types="node" />

declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare const __DEV__: boolean;

interface IHot {
  accept(dependencies: string | string[], callback?: () => void): void;
  accept(callback?: () => void): void;
  decline(dependencies?: string | string[]): void;
}

interface IHotNodeModule extends NodeModule {
  hot?: IHot;
}
