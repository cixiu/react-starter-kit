/**
 *  该文件用于修复某些第三方库的定义文件错误
 */

/**
 * 修复 antd@3.11.0 中 input/TextArea.d.ts 文件中 Cannot find name 'ResizeObserver' 的错误
 *
 * issue: https://github.com/ant-design/ant-design/issues/13405
 *
 * @interface ResizeObserver
 */
interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}
