import * as $ from 'svelte/internal/server';
import { CodeSnippet, Stack } from "carbon-components-svelte";

export default function CodeSnippetAsync($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const displayCode = "npm i carbon-components-svelte";
		const fullInstallCommand = "npm install --save-dev carbon-components-svelte carbon-icons-svelte";
		const multiDisplayCode = "export function add(a, b) {\n  return a + b;\n}";
		const multiFullCode = "export function add(a, b) {\n  return a + b;\n}\n\nexport function subtract(a, b) {\n  return a - b;\n}";
		let cachedSingleCommand = null;
		let cachedInlineCommand = null;
		let cachedMultiCommand = null;

		function logEvent(variant, event) {
			return () => {
				console.log(event, variant);
			};
		}

		async function prefetchSingle() {
			if (cachedSingleCommand) return;

			await new Promise((resolve) => setTimeout(resolve, 300));
			cachedSingleCommand = fullInstallCommand;
		}

		async function prefetchInline() {
			if (cachedInlineCommand) return;

			await new Promise((resolve) => setTimeout(resolve, 300));
			cachedInlineCommand = "rm -rf node_modules/ && npm install";
		}

		async function prefetchMulti() {
			if (cachedMultiCommand) return;

			await new Promise((resolve) => setTimeout(resolve, 300));
			cachedMultiCommand = multiFullCode;
		}

		async function copySingle() {
			if (!cachedSingleCommand) await prefetchSingle();

			await navigator.clipboard.writeText(cachedSingleCommand);
		}

		async function copyInline() {
			if (!cachedInlineCommand) await prefetchInline();

			await navigator.clipboard.writeText(cachedInlineCommand);
		}

		async function copyMulti() {
			if (!cachedMultiCommand) await prefetchMulti();

			await navigator.clipboard.writeText(cachedMultiCommand);
		}

		function onMouseenterCopyButton(variant, prefetch) {
			return () => {
				console.log("mouseenter", variant);
				prefetch();
			};
		}

		Stack($$renderer, {
			gap: 4,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				CodeSnippet($$renderer, {
					type: 'inline',
					code: 'rm -rf node_modules/',
					copy: copyInline
				});

				$$renderer.push(`<!----></div> `);
				CodeSnippet($$renderer, { type: 'single', code: displayCode, copy: copySingle });
				$$renderer.push(`<!----> `);
				CodeSnippet($$renderer, { type: 'multi', code: multiDisplayCode, copy: copyMulti });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}