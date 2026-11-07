import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Prev_next($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { next, previous, class: className = undefined } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn('flex place-items-center justify-between', className)))}><div>`);
		previous?.($$renderer);
		$$renderer.push(`<!----></div> <div>`);
		next?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}