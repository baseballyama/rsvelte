import * as $ from 'svelte/internal/server';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import { cn } from "$lib/utils.js";

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
			'data-slot': 'breadcrumb-separator',
			role: 'presentation',
			'aria-hidden': 'true',
			class: $.clsx(cn("[&>svg]:size-3.5", className)),
			...restProps
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			ChevronRightIcon($$renderer, {});
		}

		$$renderer.push(`<!--]--></li>`);
		$.bind_props($$props, { ref });
	});
}