import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Alert_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("[&_p]:leading-relaxed", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}