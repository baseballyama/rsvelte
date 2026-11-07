import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'value']);

export default function Dropdown_menu_radio_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenuPrimitive.RadioGroup, ($$anchor, DropdownMenuPrimitive_RadioGroup) => {
		DropdownMenuPrimitive_RadioGroup($$anchor, $.spread_props({ 'data-slot': 'dropdown-menu-radio-group' }, () => restProps, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			}
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}