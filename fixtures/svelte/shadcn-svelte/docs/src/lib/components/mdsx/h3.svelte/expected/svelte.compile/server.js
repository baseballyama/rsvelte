import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import HeadingAnchor from "./heading-anchor.svelte";

export default function H3($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			children,
			id,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<h3${$.attributes({
			class: $.clsx(cn("mt-12 scroll-m-28 font-heading text-lg font-medium tracking-tight [&+p]:!mt-4 *:[code]:text-xl", className)),
			id,
			...restProps
		})}>`);

		HeadingAnchor($$renderer, {
			id: id ?? undefined,
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></h3>`);
	});
}