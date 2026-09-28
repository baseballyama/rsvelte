import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Input_otp_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'input-otp-separator',
			role: 'separator',
			class: $.clsx(cn("cn-input-otp-separator flex items-center", className)),
			...restProps
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			IconPlaceholder($$renderer, {
				lucide: 'MinusIcon',
				tabler: 'IconMinus',
				hugeicons: 'MinusSignIcon',
				phosphor: 'MinusIcon',
				remixicon: 'RiSubtractLine'
			});
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}