import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import HeadingAnchor from "./heading-anchor.svelte";

export default function H1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			children,
			id,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<h1${$.attributes({
			class: $.clsx(cn("mt-2 scroll-m-28 font-heading text-3xl font-bold tracking-tight", className)),
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

		$$renderer.push(`<!----></h1>`);
	});
}