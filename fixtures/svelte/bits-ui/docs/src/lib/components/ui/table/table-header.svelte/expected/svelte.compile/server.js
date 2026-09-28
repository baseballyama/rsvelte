import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Table_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<thead${$.attributes({
			class: $.clsx(cn("[&_tr]:border-b", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></thead>`);
	});
}