import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import HeadingAnchor from "./heading-anchor.svelte";

export default function H2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			children,
			id,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<h2${$.attributes({
			class: $.clsx(cn("[&+]*:[code]:text-xl mt-10 scroll-m-28 font-heading text-xl font-medium tracking-tight first:mt-0 lg:mt-12 [&+.steps]:!mt-0 [&+.steps>h3]:!mt-4 [&+h3]:!mt-6 [&+p]:!mt-4", className)),
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

		$$renderer.push(`<!----></h2>`);
	});
}