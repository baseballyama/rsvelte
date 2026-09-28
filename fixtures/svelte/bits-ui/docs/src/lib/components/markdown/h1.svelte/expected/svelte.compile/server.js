import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function H1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h1${$.attributes({
			class: $.clsx(cn("mt-2 scroll-m-20 text-4xl font-bold", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h1>`);
	});
}