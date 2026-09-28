import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Demo_actions_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('flex items-center gap-2', className)),
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}