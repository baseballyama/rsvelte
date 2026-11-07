import * as $ from 'svelte/internal/server';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

export default function Breadcrumb_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<li${$.attributes({
			role: 'presentation',
			'aria-hidden': 'true',
			class: $.clsx(className),
			...restProps
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			ChevronRight($$renderer, { size: 16 });
		}

		$$renderer.push(`<!--]--></li>`);
		$.bind_props($$props, { ref });
	});
}