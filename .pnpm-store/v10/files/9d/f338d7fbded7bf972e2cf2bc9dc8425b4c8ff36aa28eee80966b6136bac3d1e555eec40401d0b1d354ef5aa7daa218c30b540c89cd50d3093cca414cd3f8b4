//#region src-js/bindings.d.ts

interface ErrorLabel {
  message: string | null;
  start: number;
  end: number;
}
interface OxcError {
  severity: Severity;
  message: string;
  labels: Array<ErrorLabel>;
  helpMessage: string | null;
  codeframe: string | null;
}
declare const enum Severity {
  Error = 'Error',
  Warning = 'Warning',
  Advice = 'Advice',
}
interface FormatResult {
  /** The formatted code. */
  code: string;
  /** Parse and format errors. */
  errors: Array<OxcError>;
}
//#endregion
//#region src-js/index.d.ts
/**
 * Format the given source text according to the specified options.
 */
declare function format(fileName: string, sourceText: string, options?: FormatOptions): Promise<FormatResult>;
/**
 * Configuration options for the Oxfmt.
 *
 * Most options are the same as Prettier's options.
 * See also <https://prettier.io/docs/options>
 *
 * In addition, some options are our own extensions.
 */
type FormatOptions = {
  /** Use tabs for indentation or spaces. (Default: `false`) */
  useTabs?: boolean;
  /** Number of spaces per indentation level. (Default: `2`) */
  tabWidth?: number;
  /** Which end of line characters to apply. (Default: `"lf"`) */
  endOfLine?: "lf" | "crlf" | "cr";
  /** The line length that the printer will wrap on. (Default: `100`) */
  printWidth?: number;
  /** Use single quotes instead of double quotes. (Default: `false`) */
  singleQuote?: boolean;
  /** Use single quotes instead of double quotes in JSX. (Default: `false`) */
  jsxSingleQuote?: boolean;
  /** Change when properties in objects are quoted. (Default: `"as-needed"`) */
  quoteProps?: "as-needed" | "consistent" | "preserve";
  /** Print trailing commas wherever possible. (Default: `"all"`) */
  trailingComma?: "all" | "es5" | "none";
  /** Print semicolons at the ends of statements. (Default: `true`) */
  semi?: boolean;
  /** Include parentheses around a sole arrow function parameter. (Default: `"always"`) */
  arrowParens?: "always" | "avoid";
  /** Print spaces between brackets in object literals. (Default: `true`) */
  bracketSpacing?: boolean;
  /**
   * Put the `>` of a multi-line JSX element at the end of the last line
   * instead of being alone on the next line. (Default: `false`)
   */
  bracketSameLine?: boolean;
  /**
   * How to wrap object literals when they could fit on one line or span multiple lines. (Default: `"preserve"`)
   * NOTE: In addition to Prettier's `"preserve"` and `"collapse"`, we also support `"always"`.
   */
  objectWrap?: "preserve" | "collapse" | "always";
  /** Put each attribute on a new line in JSX. (Default: `false`) */
  singleAttributePerLine?: boolean;
  /** Control whether formats quoted code embedded in the file. (Default: `"auto"`) */
  embeddedLanguageFormatting?: "auto" | "off";
  /** Whether to insert a final newline at the end of the file. (Default: `true`) */
  insertFinalNewline?: boolean;
  /** Experimental: Sort import statements. Disabled by default. */
  experimentalSortImports?: SortImportsOptions;
  /** Experimental: Sort `package.json` keys. (Default: `true`) */
  experimentalSortPackageJson?: boolean;
  /**
   * Experimental: Enable Tailwind CSS class sorting in JSX class/className attributes.
   * (Default: disabled)
   */
  experimentalTailwindcss?: TailwindcssOptions;
} & Record<string, unknown>;
/**
 * Configuration options for sort imports.
 */
type SortImportsOptions = {
  /** Partition imports by newlines. (Default: `false`) */
  partitionByNewline?: boolean;
  /** Partition imports by comments. (Default: `false`) */
  partitionByComment?: boolean;
  /** Sort side-effect imports. (Default: `false`) */
  sortSideEffects?: boolean;
  /** Sort order. (Default: `"asc"`) */
  order?: "asc" | "desc";
  /** Ignore case when sorting. (Default: `true`) */
  ignoreCase?: boolean;
  /** Add newlines between import groups. (Default: `true`) */
  newlinesBetween?: boolean;
  /** Glob patterns to identify internal imports. */
  internalPattern?: string[];
  /**
   * Custom groups configuration for organizing imports.
   * Each array element represents a group, and multiple group names in the same array are treated as one.
   * Accepts both `string` and `string[]` as group elements.
   */
  groups?: (string | string[])[];
};
/**
 * Configuration options for Tailwind CSS class sorting.
 * See https://github.com/tailwindlabs/prettier-plugin-tailwindcss#options
 */
type TailwindcssOptions = {
  /** Path to Tailwind config file (v3). e.g., `"./tailwind.config.js"` */
  config?: string;
  /** Path to Tailwind stylesheet (v4). e.g., `"./src/app.css"` */
  stylesheet?: string;
  /** List of custom function names whose arguments should be sorted. e.g., `["clsx", "cva", "tw"]` */
  functions?: string[];
  /** List of additional HTML/JSX attributes to sort (beyond `class` and `className`). e.g., `["myClassProp", ":class"]` */
  attributes?: string[];
  /** Preserve whitespace around classes. (Default: `false`) */
  preserveWhitespace?: boolean;
  /** Preserve duplicate classes. (Default: `false`) */
  preserveDuplicates?: boolean;
};
//#endregion
export { format as i, SortImportsOptions as n, TailwindcssOptions as r, FormatOptions as t };