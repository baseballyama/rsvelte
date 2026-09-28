import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeSnippet, Stack } from "carbon-components-svelte";

var root = $.from_html(`<div><!></div> <!> <!>`, 1);

export default function CodeSnippetAsync($$anchor, $$props) {
	$.push($$props, true);

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

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);
			var event_handler = $.derived(() => onMouseenterCopyButton("inline", prefetchInline));
			var event_handler_1 = $.derived(() => logEvent("inline", "mouseleave"));
			var event_handler_2 = $.derived(() => logEvent("inline", "copy"));

			CodeSnippet(node, {
				type: 'inline',
				code: 'rm -rf node_modules/',
				copy: copyInline,
				$$events: {
					'mouseenter:copy-button': function (...$$args) {
						$.get(event_handler)?.apply(this, $$args);
					},

					'mouseleave:copy-button': function (...$$args) {
						$.get(event_handler_1)?.apply(this, $$args);
					},

					copy: function (...$$args) {
						$.get(event_handler_2)?.apply(this, $$args);
					},

					'copy:error': (e) => {
						console.error("copy:error", e.detail.error);
					}
				}
			});

			$.reset(div);

			var node_1 = $.sibling(div, 2);
			var event_handler_3 = $.derived(() => onMouseenterCopyButton("single", prefetchSingle));
			var event_handler_4 = $.derived(() => logEvent("single", "mouseleave"));
			var event_handler_5 = $.derived(() => logEvent("single", "copy"));

			CodeSnippet(node_1, {
				type: 'single',
				code: displayCode,
				copy: copySingle,
				$$events: {
					'mouseenter:copy-button': function (...$$args) {
						$.get(event_handler_3)?.apply(this, $$args);
					},

					'mouseleave:copy-button': function (...$$args) {
						$.get(event_handler_4)?.apply(this, $$args);
					},

					copy: function (...$$args) {
						$.get(event_handler_5)?.apply(this, $$args);
					},

					'copy:error': (e) => {
						console.error("copy:error", e.detail.error);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);
			var event_handler_6 = $.derived(() => onMouseenterCopyButton("multi", prefetchMulti));
			var event_handler_7 = $.derived(() => logEvent("multi", "mouseleave"));
			var event_handler_8 = $.derived(() => logEvent("multi", "copy"));

			CodeSnippet(node_2, {
				type: 'multi',
				code: multiDisplayCode,
				copy: copyMulti,
				$$events: {
					'mouseenter:copy-button': function (...$$args) {
						$.get(event_handler_6)?.apply(this, $$args);
					},

					'mouseleave:copy-button': function (...$$args) {
						$.get(event_handler_7)?.apply(this, $$args);
					},

					copy: function (...$$args) {
						$.get(event_handler_8)?.apply(this, $$args);
					},

					'copy:error': (e) => {
						console.error("copy:error", e.detail.error);
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}