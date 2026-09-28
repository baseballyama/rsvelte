import * as $ from 'svelte/internal/server';
import { Minus } from '@lucide/svelte';

export default function Input_otp_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({ role: 'separator', ...restProps })}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			Minus($$renderer, {});
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}