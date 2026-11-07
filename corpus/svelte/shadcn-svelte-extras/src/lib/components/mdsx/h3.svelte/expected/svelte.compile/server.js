import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function H3($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h3${$.attributes({
			class: $.clsx(cn('mt-12 scroll-m-20 text-2xl font-semibold tracking-tight [&+p]:!mt-4 *:[code]:text-xl', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h3>`);
	});
}