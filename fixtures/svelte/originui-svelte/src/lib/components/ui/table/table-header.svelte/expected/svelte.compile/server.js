import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Table_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<thead${$.attributes({ class: $.clsx(cn(className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></thead>`);
		$.bind_props($$props, { ref });
	});
}