import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function A($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			children,
			href,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const internal = $.derived(() => href?.startsWith('/') || href?.startsWith('#'));
		const rel = $.derived(() => !internal() ? 'noopener noreferrer' : undefined);
		const target = $.derived(() => !internal() ? '_blank' : undefined);

		$$renderer.push(`<a${$.attributes({
			href,
			target: target(),
			rel: rel(),
			class: $.clsx(cn('font-medium underline underline-offset-4', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></a>`);
	});
}