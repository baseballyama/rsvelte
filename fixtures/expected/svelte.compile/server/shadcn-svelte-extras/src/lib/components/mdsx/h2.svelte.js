import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function H2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h2${$.attributes({
			class: $.clsx(cn('border-border [&+]*:[code]:text-xl mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 lg:mt-16 [&+.steps]:!mt-0 [&+.steps>h3]:!mt-4 [&+h3]:!mt-6 [&+p]:!mt-4', className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h2>`);
	});
}