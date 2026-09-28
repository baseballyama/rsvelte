import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Tree_view($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className } = $$props;

		$$renderer.push(`<div role="tree"${$.attr_class($.clsx(cn('flex flex-col', className)))}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}