import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div class="relative w-full overflow-auto"><table${$.attributes({
			class: $.clsx(cn('w-full caption-bottom text-sm', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></table></div>`);
		$.bind_props($$props, { ref });
	});
}