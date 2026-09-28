import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeSnippet } from "carbon-components-svelte";

export default function CodeSnippetHideShowMore($$anchor) {
	let code = "export function add(a: number, b: number) {\n  return a + b;\n}\n\nexport function subtract(a: number, b: number) {\n  return a - b;\n}\n\nexport function multiply(a: number, b: number) {\n  return a * b;\n}\n\nexport function divide(a: number, b: number) {\n  return a / b;\n}\n\nexport function modulo(a: number, b: number) {\n  return a % b;\n}\n\nexport function power(a: number, b: number) {\n  return a ** b;\n}\n\nexport function negate(a: number) {\n  return -a;\n}";

	CodeSnippet($$anchor, { type: 'multi', code, showMoreLess: false });
}