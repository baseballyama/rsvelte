import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Button_group_text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const mergedProps = $.derived(() => ({
			...restProps,
			class: cn("bg-muted gap-2 rounded-md border px-2.5 text-sm font-medium shadow-xs [&_svg:not([class*='size-'])]:size-4 flex items-center [&_svg]:pointer-events-none", className),
			'data-slot': 'button-group-text'
		}));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			mergedProps().children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}