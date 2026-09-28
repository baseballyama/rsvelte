import * as $ from 'svelte/internal/server';
import { CodeSnippet } from "carbon-components-svelte";

export default function CodeSnippetFeedback($$renderer) {
	let code = "export function multiply(a: number, b: number) {\n  return a * b;\n}\n\nexport function divide(a: number, b: number) {\n  return a / b;\n}\n\nexport function add(a: number, b: number) {\n  return a + b;\n}\n\nexport function subtract(a: number, b: number) {\n  return a - b;\n}";

	CodeSnippet($$renderer, { type: 'multi', code, feedback: 'Copied to clipboard' });
}