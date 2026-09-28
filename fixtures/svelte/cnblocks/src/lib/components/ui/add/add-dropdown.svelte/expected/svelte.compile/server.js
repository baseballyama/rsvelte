import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { cn } from "$lib/utils.js";
import ChevronDown from "@lucide/svelte/icons/chevron-down";

export default function Add_dropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...rest } = $$props;

		if (DropdownMenu.Root) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Root($$renderer, {
				children: ($$renderer) => {
					if (DropdownMenu.Trigger) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Trigger($$renderer, $.spread_props([
							{
								class: cn("flex size-9 items-center justify-center rounded-r-md transition-colors hover:bg-accent [&_svg]:size-3.5", className)
							},
							rest,
							{
								children: ($$renderer) => {
									ChevronDown($$renderer, {});
								},
								$$slots: { default: true }
							}
						]));

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}