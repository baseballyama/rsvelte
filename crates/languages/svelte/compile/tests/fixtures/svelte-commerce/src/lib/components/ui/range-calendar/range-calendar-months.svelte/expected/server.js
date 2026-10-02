import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Range_calendar_months($$renderer, $$props) {
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
			class: $.clsx(cn('mt-4 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}