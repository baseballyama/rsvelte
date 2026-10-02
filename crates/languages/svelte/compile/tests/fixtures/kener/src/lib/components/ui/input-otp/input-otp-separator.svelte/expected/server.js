import * as $ from 'svelte/internal/server';
import MinusIcon from "@lucide/svelte/icons/minus";

export default function Input_otp_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'input-otp-separator',
			role: 'separator',
			...restProps
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			MinusIcon($$renderer, {});
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}