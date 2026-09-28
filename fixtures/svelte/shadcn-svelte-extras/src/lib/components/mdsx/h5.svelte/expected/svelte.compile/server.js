import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function H5($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h5${$.attributes({
			class: $.clsx(cn('mt-8 scroll-m-20 text-lg font-semibold tracking-tight', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h5>`);
	});
}