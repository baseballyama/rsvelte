import * as $ from 'svelte/internal/server';
import { useOptions } from '../options.svelte.js';
import { slide } from '../transition/index.js';

export default function NodeIconButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const options = useOptions();

		let {
			children,
			success = false,
			transition = slide,
			transitionParams = { axis: 'x', duration: options.transitionDuration },
			$$slots,
			$$events,
			...rest
		} = $$props;

		let button = void 0;

		function focus() {
			button?.focus();
		}

		$$renderer.push(`<button${$.attributes({ class: 'node-icon-button', type: 'button', ...rest }, 'svelte-5ibkxh', { success })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></button>`);
		$.bind_props($$props, { focus });
	});
}