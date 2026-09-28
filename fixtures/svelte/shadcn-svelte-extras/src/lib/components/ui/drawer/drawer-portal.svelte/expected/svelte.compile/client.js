import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer as DrawerPrimitive } from 'vaul-svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Drawer_portal($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DrawerPrimitive.Portal, ($$anchor, DrawerPrimitive_Portal) => {
		DrawerPrimitive_Portal($$anchor, $.spread_props(() => restProps));
	});

	$.append($$anchor, fragment);
}