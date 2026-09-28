import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover as PopoverPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Popover_portal($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => PopoverPrimitive.Portal, ($$anchor, PopoverPrimitive_Portal) => {
		PopoverPrimitive_Portal($$anchor, $.spread_props(() => restProps));
	});

	$.append($$anchor, fragment);
}