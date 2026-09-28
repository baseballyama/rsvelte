import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Copy from "$lib/icons/copy.svelte";
import Check from "$lib/icons/check.svelte";
import { scale } from "svelte/transition";
import { onDestroy } from "svelte";

var root = $.from_html(`<pre> </pre>`);
var root_1 = $.from_html(`<div class="absolute h-4 w-4"><!></div>`);

var root_2 = $.from_html(`<div><!> <button class="hover:border-kui-light-gray-400 dark:hover:border-kui-dark-gray-400 absolute top-2/4 right-1 flex h-8 w-8 translate-y-[-50%] items-center
		justify-center rounded-md hover:border"><span class="flex items-center justify-center"><div class="relative h-4 w-4"><!> <!></div></span></button></div>`);

export default function Snippet($$anchor, $$props) {
	$.push($$props, true);

	const // TODO: Show user-visible error feedback (e.g., error toast/message)
	preSnippet = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 16, () => $.get(snippetList), (sl) => sl, ($$anchor, sl) => {
			var pre = root();
			var text_1 = $.only_child(pre, true);

			$.template_effect(() => {
				$.set_class(pre, 1, `${$.get(showPrompt) ?? ''} text-sm`);
				$.set_text(text_1, sl);
			});

			$.append($$anchor, pre);
		});

		$.append($$anchor, fragment);
	};

	let klass = $.prop($$props, 'class', 3, ""),
		type = $.prop($$props, 'type', 3, "default"),
		text = $.prop($$props, 'text', 3, ""),
		prompt = $.prop($$props, 'prompt', 3, true),
		onCopy = $.prop($$props, 'onCopy', 3, undefined);

	const snippetList = $.derived(() => {
		if (typeof text() == "string") {
			return [text()];
		} else if (Array.isArray(text())) {
			return [...text()];
		}

		return [];
	});

	let isCopied = $.state(false);
	let timeoutId;

	const copyToClipboard = async () => {
		if ($.get(snippetList).length === 0) return;

		if (!navigator.clipboard) {
			console.error("Clipboard API not supported");

			return;
		}

		const clipText = $.get(snippetList).join("\n");

		try {
			await navigator.clipboard.writeText(clipText);
			$.set(isCopied, true);

			if (timeoutId) clearTimeout(timeoutId);

			timeoutId = setTimeout(
				() => {
					$.set(isCopied, false);
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
		if (onCopy()) onCopy()();

		copyToClipboard();
	}

	const showPrompt = $.derived(() => {
		if (prompt()) {
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
		return typeBorderObj[type()];
	});

	const typeFillObj = {
		default: `bg-kui-light-bg dark:bg-kui-dark-bg`,
		success: `bg-kui-light-blue-100 dark:bg-kui-dark-blue-100`,
		error: `bg-kui-light-red-100 dark:bg-kui-dark-red-100`,
		warning: `bg-kui-light-amber-100 dark:bg-kui-dark-amber-100`,
		inverted: `bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000`
	};

	let typeFillClass = $.derived(() => {
		return typeFillObj[type()];
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
		return typeTextObj[type()];
	});

	const snippetClass = $.derived(() => {
		return `${$.get(typeBorderClass)} ${$.get(typeFillClass)} ${$.get(typeTextClass)}`;
	});

	var div = root_2();
	var node_1 = $.child(div);

	preSnippet(node_1);

	var button = $.sibling(node_1, 2);
	var span = $.child(button);
	var div_1 = $.child(span);
	var node_2 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root_1();
			var node_3 = $.child(div_2);

			Check(node_3, {});
			$.reset(div_2);
			$.transition(1, div_2, () => scale, () => ({ duration: 200 }));
			$.transition(2, div_2, () => scale, () => ({ duration: 300 }));
			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isCopied)) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();
			var node_5 = $.child(div_3);

			Copy(node_5, {});
			$.reset(div_3);
			$.transition(1, div_3, () => scale, () => ({ duration: 200 }));
			$.transition(2, div_3, () => scale, () => ({ duration: 300 }));
			$.append($$anchor, div_3);
		};

		$.if(node_4, ($$render) => {
			if (!$.get(isCopied)) $$render(consequent_1);
		});
	}

	$.reset(div_1);
	$.reset(span);
	$.reset(button);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `relative max-w-full rounded-md border px-3 py-2.5 ${$.get(snippetClass) ?? ''} ${klass() ?? ''}`);
		$.set_attribute(button, 'aria-label', $.get(isCopied) ? "Copied" : "Copy to clipboard");
	});

	$.delegated('click', button, onclick);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);