import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Divider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { class: className = "", $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<hr${$.attributes({
			...restProps,
			class: $.clsx(cn("my-12 border-t border-border", className))
		})}/>`);
	});
}