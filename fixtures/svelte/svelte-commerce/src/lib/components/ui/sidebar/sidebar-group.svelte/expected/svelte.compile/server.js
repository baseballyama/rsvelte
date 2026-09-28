import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Sidebar_group($$renderer, $$props) {
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
			'data-sidebar': 'group',
			class: $.clsx(cn('relative flex w-full min-w-0 flex-col p-2', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}