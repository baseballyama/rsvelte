import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Alert_dialog_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('flex flex-col gap-1 text-center sm:text-left', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}