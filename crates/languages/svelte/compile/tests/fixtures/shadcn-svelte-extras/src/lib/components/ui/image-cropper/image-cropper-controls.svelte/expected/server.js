import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Image_cropper_controls($$renderer, $$props) {
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
			...rest,
			class: $.clsx(cn('flex w-full place-items-center justify-center gap-2', className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}