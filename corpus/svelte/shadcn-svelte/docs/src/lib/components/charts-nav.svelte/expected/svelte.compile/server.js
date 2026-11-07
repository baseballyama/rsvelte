import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
import { cn } from "$lib/utils.js";

export default function Charts_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		const links = [
			{ name: "Area Charts", href: "/charts/area#charts" },
			{ name: "Bar Charts", href: "/charts/bar#charts" },
			{ name: "Line Charts", href: "/charts/line#charts" },
			{ name: "Pie Charts", href: "/charts/pie#charts" },
			{ name: "Radar Charts", href: "/charts/radar#charts" },
			{ name: "Radial Charts", href: "/charts/radial#charts" },
			{ name: "Tooltips", href: "/charts/tooltip#charts" }
		];

		$$renderer.push(`<div class="relative overflow-hidden">`);

		ScrollArea($$renderer, {
			class: 'max-w-[600px] lg:max-w-none',
			orientation: 'both',
			scrollbarXClasses: 'invisible',
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attributes({
					class: $.clsx(cn("flex items-center", className)),
					...restProps
				})}><!--[-->`);

				const each_array = $.ensure_array_like(links);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let link = each_array[$$index];

					$$renderer.push(`<a${$.attr('href', link.href)}${$.attr('data-active', link.href.startsWith(page.url.pathname))}${$.attr_class($.clsx(cn("flex h-7 shrink-0 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary")))}>${$.escape(link.name)}</a>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}