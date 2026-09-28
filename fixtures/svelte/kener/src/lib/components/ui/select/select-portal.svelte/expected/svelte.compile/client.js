import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Select_portal($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SelectPrimitive.Portal, ($$anchor, SelectPrimitive_Portal) => {
		SelectPrimitive_Portal($$anchor, $.spread_props(() => restProps));
	});

	$.append($$anchor, fragment);
}