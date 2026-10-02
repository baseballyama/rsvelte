import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Table($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div class="w-full overflow-auto rounded-md"><table${$.attributes({
			class: $.clsx(cn("w-full caption-bottom text-sm", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></table></div>`);
	});
}