import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Blockquote($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<blockquote${$.attributes({
			class: $.clsx(cn("mt-6 border-l-2 pl-6 italic", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></blockquote>`);
	});
}