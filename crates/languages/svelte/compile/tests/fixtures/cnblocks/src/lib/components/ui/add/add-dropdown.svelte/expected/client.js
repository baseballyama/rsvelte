import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { cn } from "$lib/utils.js";
import ChevronDown from "@lucide/svelte/icons/chevron-down";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<!> <!>`, 1);

export default function Add_dropdown($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn("flex size-9 items-center justify-center rounded-r-md transition-colors hover:bg-accent [&_svg]:size-3.5", $$props.class));

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, $.spread_props(
							{
								get class() {
									return $.get($0);
								}
							},
							() => rest,
							{
								children: ($$anchor, $$slotProps) => {
									ChevronDown($$anchor, {});
								},
								$$slots: { default: true }
							}
						));
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.snippet(node_2, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}