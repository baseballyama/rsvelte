import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Code_preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, code, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn('[&_pre]:text-foreground [&_code]:py-4 [&_pre]:overflow-x-auto [&_pre]:overflow-y-auto [&_pre]:rounded-md [&_pre]:px-6 [&_pre]:py-4 [&_pre]:text-left [&_pre]:text-sm', className)),
			...restProps
		})}>${$.html(code)}</div>`);
	});
}