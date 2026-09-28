import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Breadcrumb_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<li${$.attributes({
			class: $.clsx(cn('inline-flex items-center gap-1.5', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></li>`);
		$.bind_props($$props, { ref });
	});
}