import { r as TailwindcssOptions } from "./index-Cy_w6Ejz.js";
import { Options } from "prettier";

//#region src-js/libs/prettier.d.ts

type FormatEmbeddedCodeParam = {
  code: string;
  tagName: string;
  options: Options;
};
/**
 * Format xxx-in-js code snippets
 *
 * @returns Formatted code snippet
 * TODO: In the future, this should return `Doc` instead of string,
 * otherwise, we cannot calculate `printWidth` correctly.
 */
declare function formatEmbeddedCode({
  code,
  tagName,
  options
}: FormatEmbeddedCodeParam): Promise<string>;
type FormatFileParam = {
  code: string;
  parserName: string;
  fileName: string;
  options: Options & {
    experimentalTailwindcss?: TailwindcssOptions;
  };
};
/**
 * Format non-js file
 *
 * @returns Formatted code
 */
declare function formatFile({
  code,
  parserName,
  fileName,
  options
}: FormatFileParam): Promise<string>;
interface SortTailwindClassesArgs {
  filepath: string;
  classes: string[];
  options?: {
    experimentalTailwindcss?: TailwindcssOptions;
  } & Record<string, unknown>;
}
/**
 * Process Tailwind CSS classes found in JSX attributes.
 * @param args - Object containing filepath, classes, and options
 * @returns Array of sorted class strings (same order/length as input)
 */
declare function sortTailwindClasses({
  filepath,
  classes,
  options
}: SortTailwindClassesArgs): Promise<string[]>;
//#endregion
export { formatEmbeddedCode, formatFile, sortTailwindClasses };