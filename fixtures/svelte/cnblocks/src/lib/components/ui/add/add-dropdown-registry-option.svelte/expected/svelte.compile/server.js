import * as $ from 'svelte/internal/server';
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { useAddDropdownRegistryOption } from "$lib/components/ui/add/add.svelte.js";
import { box } from "svelte-toolbelt";
import { cn } from "$lib/utils";
import CheckIcon from "@lucide/svelte/icons/check";
import AddRegistryLogo from "./add-registry-logo.svelte";

export default function Add_dropdown_registry_option($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			registry,
			class: className,
			fallbackIcon,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const dropdownRegistryOptionState = useAddDropdownRegistryOption({ registry: box.with(() => registry) });

		if (DropdownMenu.Item) {
			$$renderer.push('<!--[-->');

			DropdownMenu.Item($$renderer, $.spread_props([
				{
					class: cn("flex items-center justify-between [&_svg]:size-3.5", className)
				},
				rest,
				dropdownRegistryOptionState.props,
				{
					children: ($$renderer) => {
						$$renderer.push(`<span class="flex items-center gap-2">`);

						AddRegistryLogo($$renderer, {
							registry: dropdownRegistryOptionState.opts.registry.current,
							fallbackIcon
						});

						$$renderer.push(`<!----> ${$.escape(registry)}</span> <div class="size-4">`);

						if (dropdownRegistryOptionState.root.registry === registry) {
							$$renderer.push('<!--[0-->');
							CheckIcon($$renderer, { class: 'size-4' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
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