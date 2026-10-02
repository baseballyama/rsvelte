import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
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