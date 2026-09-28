import * as $ from 'svelte/internal/server';
import { scale } from "svelte/transition";
import Copy from "$lib/icons/copy.svelte";
import Check from "$lib/icons/check.svelte";
import Button from "$lib/button/button.svelte";

export default function Copy_button($$renderer, $$props) {
	let {
		label = "Copy to clipboard",
		textToCopy = "",
		disabled = false,
		size = "medium",
		variant = "secondary",
		shape = "square",
		$$slots,
		$$events,
		...rest
	} = $$props;

	let isCopied = false;
	let timeoutId;

	async function copyToClipboard() {
		if (disabled || !navigator.clipboard) {
			if (!navigator.clipboard) console.error("Clipboard API not supported");

			return;
		}

		try {
			await navigator.clipboard.writeText(textToCopy);
			isCopied = true;

			if (timeoutId) clearTimeout(timeoutId);

			timeoutId = setTimeout(
				() => {
					isCopied = false;
					timeoutId = undefined;
				},
				1000
			);
		} catch(error) {
			console.error("Failed to copy text:", error);
		}
	}

	Button($$renderer, $.spread_props([
		rest,
		{
			disabled,
			size,
			variant,
			shape,
			svgOnly: true,
			'aria-label': isCopied ? "Copied" : label,
			onclick: copyToClipboard,
			children: ($$renderer) => {
				$$renderer.push(`<span class="relative size-4">`);

				if (isCopied) {
					$$renderer.push(`<!--[0--><span class="absolute inset-0">`);
					Check($$renderer, {});
					$$renderer.push(`<!----></span>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="absolute inset-0">`);
					Copy($$renderer, {});
					$$renderer.push(`<!----></span>`);
				}

				$$renderer.push(`<!--]--></span>`);
			},
			$$slots: { default: true }
		}
	]));
}