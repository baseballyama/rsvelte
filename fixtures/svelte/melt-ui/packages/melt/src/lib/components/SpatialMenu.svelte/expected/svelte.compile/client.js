import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SpatialMenu as SpatialMenuBuilder } from "../builders/SpatialMenu.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function SpatialMenu($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const spatialMenu = new SpatialMenuBuilder(rest);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children, () => spatialMenu);
	$.append($$anchor, fragment);
	$.pop();
}