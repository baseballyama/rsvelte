import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function H4($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h4${$.attributes({
			class: $.clsx(cn("-mb-2 mt-8 scroll-m-20 text-lg font-bold tracking-tight", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h4>`);
	});
}