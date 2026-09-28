import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Dialog_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}