import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Alert_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h5${$.attributes({
			class: $.clsx(cn("mb-1 ml-8 font-medium leading-none tracking-tight", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h5>`);
	});
}