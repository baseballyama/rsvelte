import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Ul($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<ul${$.attributes({
			class: $.clsx(cn('my-6 ml-6 list-disc [&>li]:mt-2', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
	});
}