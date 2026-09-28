import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Command_shortcut($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<span${$.attributes({
			'data-slot': 'command-shortcut',
			class: $.clsx(cn('ml-auto text-xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></span>`);
		$.bind_props($$props, { ref });
	});
}