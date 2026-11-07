import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Add_dropdown_separator($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
		DropdownMenu_Separator($$anchor, $.spread_props(
			{
				get class() {
					return $$props.class;
				}
			},
			() => rest
		));
	});

	$.append($$anchor, fragment);
}