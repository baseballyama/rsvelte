import * as $ from 'svelte/internal/server';
import { ChevronRight } from '@lucide/svelte';
import { cn } from '$lib/core/utils';

export default function Breadcrumb_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<li${$.attributes({
			role: 'presentation',
			'aria-hidden': 'true',
			class: $.clsx(cn('[&>svg]:size-3.5', className)),
			...restProps
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			ChevronRight($$renderer, {});
		}

		$$renderer.push(`<!--]--></li>`);
		$.bind_props($$props, { ref });
	});
}