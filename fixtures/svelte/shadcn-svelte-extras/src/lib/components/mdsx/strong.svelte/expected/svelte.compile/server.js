import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Strong($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<strong${$.attributes({ class: $.clsx(cn('font-semibold', className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></strong>`);
	});
}