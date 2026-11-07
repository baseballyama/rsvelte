import * as $ from 'svelte/internal/server';
import { cn } from '$lib/core/utils';

export default function Breadcrumb_link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			href = undefined,
			child,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const attrs = $.derived(() => ({
			class: cn('hover:text-foreground transition-colors', className),
			href,
			...restProps
		}));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: attrs() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({ ...attrs() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}