import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function H4($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h4${$.attributes({
			class: $.clsx(cn('mt-8 scroll-m-20 text-xl font-semibold tracking-tight', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h4>`);
	});
}