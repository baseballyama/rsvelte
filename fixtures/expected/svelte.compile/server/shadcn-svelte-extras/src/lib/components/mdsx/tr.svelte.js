import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Tr($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<tr${$.attributes({
			class: $.clsx(cn('border-border even:bg-muted m-0 border-t p-0', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></tr>`);
	});
}