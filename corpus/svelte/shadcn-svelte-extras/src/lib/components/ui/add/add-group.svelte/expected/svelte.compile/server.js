import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Add_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('border-border bg-background flex h-9 max-w-full min-w-0 items-center rounded-md border', className)),
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}