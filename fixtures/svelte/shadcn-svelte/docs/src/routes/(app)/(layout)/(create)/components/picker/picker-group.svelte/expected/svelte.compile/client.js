import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Picker_group($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenuPrimitive.Group, ($$anchor, DropdownMenuPrimitive_Group) => {
		DropdownMenuPrimitive_Group($$anchor, $.spread_props({ 'data-slot': 'dropdown-menu-group' }, () => restProps));
	});

	$.append($$anchor, fragment);
}