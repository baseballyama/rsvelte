import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menubar as MenubarPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Menubar_menu($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => MenubarPrimitive.Menu, ($$anchor, MenubarPrimitive_Menu) => {
		MenubarPrimitive_Menu($$anchor, $.spread_props(() => restProps));
	});

	$.append($$anchor, fragment);
}