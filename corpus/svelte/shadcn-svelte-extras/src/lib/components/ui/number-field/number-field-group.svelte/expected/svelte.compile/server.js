import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Number_field_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('border-border flex h-9 items-center overflow-hidden rounded-md border', '*:data-[slot=number-field-increment]:rounded-end *:data-[slot=number-field-increment]:rounded-none *:data-[slot=number-field-increment]:focus-visible:ring-0', '*:data-[slot=number-field-decrement]:rounded-start *:data-[slot=number-field-decrement]:rounded-none *:data-[slot=number-field-decrement]:focus-visible:ring-0', '*:data-[slot=number-field-input]:rounded-none *:data-[slot=number-field-input]:border-x *:data-[slot=number-field-input]:border-y-0 *:data-[slot=number-field-input]:first:border-s-0 *:data-[slot=number-field-input]:last:border-e-0', className)),
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}