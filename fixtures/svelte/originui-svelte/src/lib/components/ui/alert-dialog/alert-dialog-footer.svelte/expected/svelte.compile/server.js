import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Alert_dialog_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('flex flex-col-reverse gap-3 sm:flex-row sm:justify-end', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}