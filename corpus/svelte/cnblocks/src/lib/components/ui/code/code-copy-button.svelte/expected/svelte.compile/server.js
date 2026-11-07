import * as $ from 'svelte/internal/server';
import { CopyButton } from "$lib/components/ui/copy-button";
import { cn } from "$lib/utils.js";
import { useCodeCopyButton } from "./code.svelte.js";

export default function Code_copy_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant = "ghost",
			size = "icon",
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const copyButton = useCodeCopyButton();

		CopyButton($$renderer, $.spread_props([
			{
				class: cn("absolute top-2 right-2", className),
				text: copyButton.code,
				variant,
				size
			},
			rest
		]));

		$.bind_props($$props, { ref });
	});
}