import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import Button from "$lib/registry/ui/button/button.svelte";
import { cn } from "$lib/utils.js";

export default function Main_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items, class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<nav${$.attributes({
			class: $.clsx(cn("items-center gap-0.5", className)),
			...restProps
		})}><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			Button($$renderer, {
				href: item.href,
				variant: 'ghost',
				size: 'sm',
				class: cn(page.url.pathname === item.href && "text-primary"),
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(item.title)}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></nav>`);
	});
}