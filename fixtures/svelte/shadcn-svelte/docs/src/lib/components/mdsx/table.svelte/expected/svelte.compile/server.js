import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div class="my-6 no-scrollbar w-full overflow-y-auto rounded-lg border"><table${$.attributes({
			class: $.clsx(cn("relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></table></div>`);
	});
}