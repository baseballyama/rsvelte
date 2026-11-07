import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
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
			class: $.clsx(cn("cn-breadcrumb-separator", className)),
			...restProps
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			IconPlaceholder($$renderer, {
				lucide: 'ChevronRightIcon',
				tabler: 'IconChevronRight',
				hugeicons: 'ArrowRight01Icon',
				phosphor: 'CaretRightIcon',
				remixicon: 'RiArrowRightSLine'
			});
		}

		$$renderer.push(`<!--]--></li>`);
		$.bind_props($$props, { ref });
	});
}