import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<a${$.attributes({
			...rest,
			class: $.clsx(cn('text-foreground font-medium underline underline-offset-4', className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></a>`);
	});
}