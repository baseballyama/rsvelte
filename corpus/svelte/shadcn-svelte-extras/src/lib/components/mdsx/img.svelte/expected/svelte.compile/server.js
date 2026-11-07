import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Img($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, src, alt, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<img${$.attributes({
			src,
			alt,
			class: $.clsx(cn('rounded-md', className)),
			...restProps
		})} onload="this.__e=event" onerror="this.__e=event"/>`);
	});
}