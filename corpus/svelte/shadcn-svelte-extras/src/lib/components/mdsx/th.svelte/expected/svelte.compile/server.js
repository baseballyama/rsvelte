import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Th($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<th${$.attributes({
			class: $.clsx(cn('border-border border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></th>`);
	});
}