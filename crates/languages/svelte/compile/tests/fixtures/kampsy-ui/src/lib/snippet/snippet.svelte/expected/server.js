import * as $ from 'svelte/internal/server';
import Copy from "$lib/icons/copy.svelte";
import Check from "$lib/icons/check.svelte";
import { scale } from "svelte/transition";
import { onDestroy } from "svelte";

export default function Snippet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: klass = "",
			type = "default",
			text = "",
			prompt = true,
			onCopy = undefined
		} = $$props;

		const snippetList = $.derived(() => {
			if (typeof text == "string") {
				return [text];
			} else if (Array.isArray(text)) {
				return [...text];
			}

			return [];
		});

		let isCopied = false;
		let timeoutId;

		const copyToClipboard = async () => {
			if (snippetList().length === 0) return;

			if (!navigator.clipboard) {
				console.error("Clipboard API not supported");

				return;
			}

			const clipText = snippetList().join("\n");

			try {
				await navigator.clipboard.writeText(clipText);
				isCopied = true;

				if (timeoutId) clearTimeout(timeoutId);

				timeoutId = setTimeout(
					() => {
						isCopied = false;
						timeoutId = undefined;
					},
					1500
				);
			} catch(error) {
				console.error("Failed to copy text:", error);

				// TODO: Show user-visible error feedback (e.g., error toast/message)
			}
		};

		onDestroy(() => {
			if (timeoutId) clearTimeout(timeoutId);
		});

		function onclick() {
			if (onCopy) onCopy();

			copyToClipboard();
		}

		const showPrompt = $.derived(() => {
			if (prompt) {
				return "before:content-['$'] before:px-2";
			}

			return "";
		});

		const typeBorderObj = {
			default: `border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400`,
			success: `border-kui-light-blue-400 dark:border-kui-dark-blue-400`,
			error: `border-kui-light-red-400 dark:border-kui-dark-red-400`,
			warning: `border-kui-light-amber-400 dark:border-kui-dark-amber-400`,
			inverted: `border-kui-light-gray-alpha-400 dark:border-kui-dark-gray-alpha-400`
		};

		let typeBorderClass = $.derived(() => {
			return typeBorderObj[type];
		});

		const typeFillObj = {
			default: `bg-kui-light-bg dark:bg-kui-dark-bg`,
			success: `bg-kui-light-blue-100 dark:bg-kui-dark-blue-100`,
			error: `bg-kui-light-red-100 dark:bg-kui-dark-red-100`,
			warning: `bg-kui-light-amber-100 dark:bg-kui-dark-amber-100`,
			inverted: `bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000`
		};

		let typeFillClass = $.derived(() => {
			return typeFillObj[type];
		});

		const typeTextObj = {
			default: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 selection:bg-kui-light-gray-1000
		selection:text-kui-light-gray-100 dark:selection:bg-kui-dark-gray-1000
		dark:selection:text-kui-dark-gray-100`,

			success: `text-kui-light-blue-900 dark:text-kui-dark-blue-900 selection:bg-kui-light-blue-1000
		selection:text-kui-light-blue-100 dark:selection:bg-kui-dark-blue-1000
		dark:selection:text-kui-dark-blue-100`,

			error: `text-kui-light-red-900 dark:text-kui-dark-red-900 selection:bg-kui-light-red-1000
		selection:text-kui-light-red-100 dark:selection:bg-kui-dark-red-1000 dark:selection:text-kui-dark-red-100
		dark:selection:text-kui-dark-red-100`,

			warning: `text-kui-light-amber-900 dark:text-kui-dark-amber-900 selection:bg-kui-light-amber-1000
		selection:text-kui-light-amber-100 dark:selection:bg-kui-dark-amber-1000
		dark:selection:text-kui-dark-amber-100`,

			inverted: `text-kui-light-gray-100 dark:text-kui-dark-gray-100 selection:bg-kui-light-gray-100
		selection:text-kui-light-gray-1000 dark:selection:bg-kui-dark-gray-100
		dark:selection:text-kui-dark-gray-1000`
		};

		const typeTextClass = $.derived(() => {
			return typeTextObj[type];
		});

		const snippetClass = $.derived(() => {
			return `${typeBorderClass()} ${typeFillClass()} ${typeTextClass()}`;
		});

		function preSnippet($$renderer) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(snippetList());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let sl = each_array[$$index];

				$$renderer.push(`<pre${$.attr_class(`${$.stringify(showPrompt())} text-sm`)}>${$.escape(sl)}</pre>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<div${$.attr_class(`relative max-w-full rounded-md border px-3 py-2.5 ${$.stringify(snippetClass())} ${$.stringify(klass)}`)}>`);
		preSnippet($$renderer);
		$$renderer.push(`<!----> <button${$.attr('aria-label', isCopied ? "Copied" : "Copy to clipboard")} class="hover:border-kui-light-gray-400 dark:hover:border-kui-dark-gray-400 absolute top-2/4 right-1 flex h-8 w-8 translate-y-[-50%] items-center justify-center rounded-md hover:border"><span class="flex items-center justify-center"><div class="relative h-4 w-4">`);

		if (isCopied) {
			$$renderer.push(`<!--[0--><div class="absolute h-4 w-4">`);
			Check($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!isCopied) {
			$$renderer.push(`<!--[0--><div class="absolute h-4 w-4">`);
			Copy($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></span></button></div>`);
	});
}