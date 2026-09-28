import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'align', 'children']);

export default function Add_dropdown_content($$anchor, $$props) {
	let align = $.prop($$props, 'align', 3, "end"),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
		DropdownMenu_Content($$anchor, $.spread_props(
			{
				get align() {
					return align();
				}
			},
			() => rest,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	});

	$.append($$anchor, fragment);
}