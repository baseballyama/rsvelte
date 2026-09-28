import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer as DrawerPrimitive } from 'vaul-svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Drawer_close($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DrawerPrimitive.Close, ($$anchor, DrawerPrimitive_Close) => {
		DrawerPrimitive_Close($$anchor, $.spread_props({ 'data-slot': 'drawer-close' }, () => restProps, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			}
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}