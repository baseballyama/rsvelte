import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Blockquote($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<blockquote${$.attributes({
			class: $.clsx(cn("mt-6 border-s-2 ps-6 italic", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></blockquote>`);
	});
}