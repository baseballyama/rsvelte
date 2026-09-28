import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Select_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 11, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SelectPrimitive.Group, ($$anchor, SelectPrimitive_Group) => {
		SelectPrimitive_Group($$anchor, $.spread_props({ 'data-slot': 'select-group' }, () => restProps));
	});

	$.append($$anchor, fragment);
	$.pop();
}