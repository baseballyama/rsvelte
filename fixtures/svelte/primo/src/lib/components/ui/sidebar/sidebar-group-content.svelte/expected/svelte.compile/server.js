import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.ts';

export default function Sidebar_group_content($$renderer, $$props) {
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
			'data-sidebar': 'group-content',
			class: $.clsx(cn('w-full text-sm', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}