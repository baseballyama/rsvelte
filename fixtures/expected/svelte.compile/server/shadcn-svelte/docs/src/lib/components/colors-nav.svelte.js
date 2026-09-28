import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { getColors } from "$lib/colors.js";
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
import { cn } from "$lib/utils.js";

export default function Colors_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const colors = getColors();
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("flex items-center", className)),
			...restProps
		})}>`);

		ScrollArea($$renderer, {
			class: 'max-w-full',
			orientation: 'both',
			scrollbarXClasses: 'invisible',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center"><!--[-->`);

				const each_array = $.ensure_array_like(colors);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let colorPalette = each_array[index];

					$$renderer.push(`<a${$.attr('href', `/colors#${$.stringify(colorPalette.name)}`)}${$.attr('data-active', page.url.pathname?.startsWith(colorPalette.name) || index === 0 && page.url.pathname === "/colors")}${$.attr_class($.clsx(cn("flex h-7 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground capitalize transition-colors hover:text-primary data-[active=true]:text-primary")))}>${$.escape(colorPalette.name)}</a>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}