import * as $ from 'svelte/internal/server';
import { slide } from '$lib/transition/index.js';

export default function ToggleButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			duration = 400,
			checked = false,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$$renderer.push(`<button${$.attributes({ type: 'button', ...rest }, 'svelte-1kw2gel', { checked })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></button>`);
		$.bind_props($$props, { checked });
	});
}