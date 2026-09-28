import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Page_header_heading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h1${$.attributes({
			class: $.clsx(cn("leading-tighter max-w-2xl text-4xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h1>`);
	});
}