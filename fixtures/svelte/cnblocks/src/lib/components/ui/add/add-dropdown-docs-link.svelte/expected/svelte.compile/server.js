import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import ExternalLink from "@lucide/svelte/icons/external-link";
import { cn } from "$lib/utils";

export default function Add_dropdown_docs_link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;

		if (DropdownMenu.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Item($$renderer, $.spread_props([
				{
					class: cn("", className),
					onSelect: () => {
						if (typeof window !== "undefined") {
							window.open("https://jsrepo.dev/docs/cli/add", "_blank");
						}
					}
				},
				rest,
				{
					children: ($$renderer) => {
						ExternalLink($$renderer, { class: 'size-4' });
						$$renderer.push(`<!----> <span class="text-sm">View CLI Documentation</span>`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}