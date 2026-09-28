import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Timeline_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<h3${$.attributes({
			'data-slot': 'timeline-title',
			class: $.clsx(cn('text-sm font-medium', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h3>`);
		$.bind_props($$props, { ref });
	});
}