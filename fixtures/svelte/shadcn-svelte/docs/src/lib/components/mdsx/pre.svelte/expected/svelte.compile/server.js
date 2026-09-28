import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import CopyButton from "$lib/components/copy-button.svelte";
import { cn } from "$lib/utils.js";

export default function Pre($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;
		let preNode = void 0;
		let code = "";

		onMount(() => {
			if (preNode) {
				code = preNode.innerText.trim().replaceAll("  ", " ");
			}
		});

		$$renderer.push(`<pre${$.attributes({
			class: $.clsx(cn("no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></pre> `);
		CopyButton($$renderer, { text: code });
		$$renderer.push(`<!---->`);
	});
}