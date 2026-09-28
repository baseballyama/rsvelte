import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function P($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<p${$.attributes({
			class: $.clsx(cn("not-first:mt-6 leading-7", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></p>`);
	});
}