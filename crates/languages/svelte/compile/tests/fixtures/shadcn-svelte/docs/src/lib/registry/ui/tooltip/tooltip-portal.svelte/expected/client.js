import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip as TooltipPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Tooltip_portal($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => TooltipPrimitive.Portal, ($$anchor, TooltipPrimitive_Portal) => {
		TooltipPrimitive_Portal($$anchor, $.spread_props(() => restProps));
	});

	$.append($$anchor, fragment);
}