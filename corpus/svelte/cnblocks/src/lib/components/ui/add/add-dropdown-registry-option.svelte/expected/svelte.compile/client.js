import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { useAddDropdownRegistryOption } from "$lib/components/ui/add/add.svelte.js";
import { box } from "svelte-toolbelt";
import { cn } from "$lib/utils";
import CheckIcon from "@lucide/svelte/icons/check";
import AddRegistryLogo from "./add-registry-logo.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'registry',
	'class',
	'fallbackIcon'
]);

var root = $.from_html(`<span class="flex items-center gap-2"><!> </span> <div class="size-4"><!></div>`, 1);

export default function Add_dropdown_registry_option($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const dropdownRegistryOptionState = useAddDropdownRegistryOption({ registry: box.with(() => $$props.registry) });
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("flex items-center justify-between [&_svg]:size-3.5", $$props.class));

		$.component(node, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
			DropdownMenu_Item($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => rest,
				() => dropdownRegistryOptionState.props,
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var span = $.first_child(fragment_1);
						var node_1 = $.child(span);

						AddRegistryLogo(node_1, {
							get registry() {
								return dropdownRegistryOptionState.opts.registry.current;
							},

							get fallbackIcon() {
								return $$props.fallbackIcon;
							}
						});

						var text = $.sibling(node_1);

						$.reset(span);

						var div = $.sibling(span, 2);
						var node_2 = $.child(div);

						{
							var consequent = ($$anchor) => {
								CheckIcon($$anchor, { class: 'size-4' });
							};

							$.if(node_2, ($$render) => {
								if (dropdownRegistryOptionState.root.registry === $$props.registry) $$render(consequent);
							});
						}

						$.reset(div);
						$.template_effect(() => $.set_text(text, ` ${$$props.registry ?? ''}`));
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}