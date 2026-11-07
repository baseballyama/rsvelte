import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Mobile_link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			onClose,
			href = "#",
			children,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<a${$.attributes({ href, class: $.clsx(cn(className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></a>`);
	});
}