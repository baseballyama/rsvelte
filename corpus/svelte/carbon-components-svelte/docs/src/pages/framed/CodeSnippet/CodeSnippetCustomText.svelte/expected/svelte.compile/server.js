import * as $ from 'svelte/internal/server';
import { CodeSnippet } from "carbon-components-svelte";

export default function CodeSnippetCustomText($$renderer) {
	let code = "export function add(a: number, b: number) {\n  return a + b;\n}\n\nexport function subtract(a: number, b: number) {\n  return a - b;\n}\n\nexport function multiply(a: number, b: number) {\n  return a * b;\n}\n\nexport function divide(a: number, b: number) {\n  return a / b;\n}\n\nexport function modulo(a: number, b: number) {\n  return a % b;\n}\n\nexport function power(a: number, b: number) {\n  return a ** b;\n}\n\nexport function negate(a: number) {\n  return -a;\n}";

	CodeSnippet($$renderer, {
		type: 'multi',
		code,
		showMoreText: 'Expand',
		showLessText: 'Collapse'
	});
}