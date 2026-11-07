import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Drawer_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('mt-auto flex flex-col gap-2 p-4', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref, class: className });
	});
}