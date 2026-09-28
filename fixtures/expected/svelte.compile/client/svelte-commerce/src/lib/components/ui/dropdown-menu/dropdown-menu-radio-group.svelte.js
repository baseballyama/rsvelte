import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'children']);

export default function Dropdown_menu_radio_group($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, undefined),
		rest = $.rest_props($$props, rest_excludes);

	const children_render = $.derived(() => $$props.children);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $.get(children_render) ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.component(node, () => DropdownMenuPrimitive.RadioGroup, ($$anchor, DropdownMenuPrimitive_RadioGroup) => {
			DropdownMenuPrimitive_RadioGroup($$anchor, {
				get value() {
					return value();
				},

				set value($$value) {
					value($$value);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}