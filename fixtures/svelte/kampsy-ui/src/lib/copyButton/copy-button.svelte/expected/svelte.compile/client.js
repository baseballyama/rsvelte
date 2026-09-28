import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scale } from "svelte/transition";
import Copy from "$lib/icons/copy.svelte";
import Check from "$lib/icons/check.svelte";
import Button from "$lib/button/button.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'label',
	'textToCopy',
	'disabled',
	'size',
	'variant',
	'shape'
]);

var root = $.from_html(`<span class="absolute inset-0"><!></span>`);
var root_1 = $.from_html(`<span class="relative size-4"><!></span>`);

export default function Copy_button($$anchor, $$props) {
	let label = $.prop($$props, 'label', 3, "Copy to clipboard"),
		textToCopy = $.prop($$props, 'textToCopy', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		size = $.prop($$props, 'size', 3, "medium"),
		variant = $.prop($$props, 'variant', 3, "secondary"),
		shape = $.prop($$props, 'shape', 3, "square"),
		rest = $.rest_props($$props, rest_excludes);

	let isCopied = $.state(false);
	let timeoutId;

	async function copyToClipboard() {
		if (disabled() || !navigator.clipboard) {
			if (!navigator.clipboard) console.error("Clipboard API not supported");

			return;
		}

		try {
			await navigator.clipboard.writeText(textToCopy());
			$.set(isCopied, true);

			if (timeoutId) clearTimeout(timeoutId);

			timeoutId = setTimeout(
				() => {
					$.set(isCopied, false);
					timeoutId = undefined;
				},
				1000
			);
		} catch(error) {
			console.error("Failed to copy text:", error);
		}
	}

	{
		let $0 = $.derived(() => $.get(isCopied) ? "Copied" : label());

		Button($$anchor, $.spread_props(() => rest, {
			get disabled() {
				return disabled();
			},

			get size() {
				return size();
			},

			get variant() {
				return variant();
			},

			get shape() {
				return shape();
			},
			svgOnly: true,
			get 'aria-label'() {
				return $.get($0);
			},
			onclick: copyToClipboard,
			children: ($$anchor, $$slotProps) => {
				var span = root_1();
				var node = $.child(span);

				{
					var consequent = ($$anchor) => {
						var span_1 = root();
						var node_1 = $.child(span_1);

						Check(node_1, {});
						$.reset(span_1);
						$.transition(1, span_1, () => scale, () => ({ duration: 200 }));
						$.transition(2, span_1, () => scale, () => ({ duration: 300 }));
						$.append($$anchor, span_1);
					};

					var alternate = ($$anchor) => {
						var span_2 = root();
						var node_2 = $.child(span_2);

						Copy(node_2, {});
						$.reset(span_2);
						$.transition(1, span_2, () => scale, () => ({ duration: 200 }));
						$.transition(2, span_2, () => scale, () => ({ duration: 300 }));
						$.append($$anchor, span_2);
					};

					$.if(node, ($$render) => {
						if ($.get(isCopied)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(span);
				$.append($$anchor, span);
			},
			$$slots: { default: true }
		}));
	}
}