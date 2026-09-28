import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as DialogPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Dialog_portal($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DialogPrimitive.Portal, ($$anchor, DialogPrimitive_Portal) => {
		DialogPrimitive_Portal($$anchor, $.spread_props(() => restProps));
	});

	$.append($$anchor, fragment);
}