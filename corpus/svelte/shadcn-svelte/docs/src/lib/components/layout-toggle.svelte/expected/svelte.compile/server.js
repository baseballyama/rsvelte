import * as $ from 'svelte/internal/server';
import GalleryHorizontalIcon from "@lucide/svelte/icons/gallery-horizontal";
import { Button } from "$lib/registry/ui/button/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";
import { cn } from "$lib/utils.js";

export default function Layout_toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;
		const userConfig = UserConfigContext.get();

		Button($$renderer, $.spread_props([
			{
				variant: 'ghost',
				size: 'icon',
				class: cn("size-8", className),
				onclick: () => {
					userConfig.setConfig({
						layout: userConfig.current.layout === "full" ? "fixed" : "full"
					});
				}
			},
			restProps,
			{
				title: 'Toggle layout',
				children: ($$renderer) => {
					$$renderer.push(`<span class="sr-only">Toggle layout</span> `);
					GalleryHorizontalIcon($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}