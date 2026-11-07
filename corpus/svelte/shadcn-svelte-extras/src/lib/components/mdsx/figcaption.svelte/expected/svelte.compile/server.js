import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Figcaption($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<figcaption${$.attributes({
			class: $.clsx(cn('text-muted-foreground flex items-center gap-2 text-sm [&_svg]:size-4 [&_svg]:opacity-70', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></figcaption>`);
	});
}