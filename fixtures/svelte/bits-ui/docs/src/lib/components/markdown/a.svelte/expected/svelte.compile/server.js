import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function A($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			href = "",
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const internal = $.derived(() => href?.startsWith("/") || href?.startsWith("#"));
		const rel = $.derived(() => !internal() ? "noopener noreferrer" : undefined);
		const target = $.derived(() => !internal() ? "_blank" : undefined);

		$$renderer.push(`<a${$.attributes({
			href,
			target: target(),
			rel: rel(),
			class: $.clsx(cn("link leading-7", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></a>`);
	});
}