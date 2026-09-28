import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LinkPreview as HoverCardPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Hover_card_portal($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => HoverCardPrimitive.Portal, ($$anchor, HoverCardPrimitive_Portal) => {
		HoverCardPrimitive_Portal($$anchor, $.spread_props(() => restProps));
	});

	$.append($$anchor, fragment);
}