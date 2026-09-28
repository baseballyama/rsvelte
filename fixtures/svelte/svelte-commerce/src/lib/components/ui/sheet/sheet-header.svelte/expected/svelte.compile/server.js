import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Sheet_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('flex flex-col space-y-2 text-center sm:text-left', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}