import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingRootState } from "../use-floating-layer.svelte.js";

export default function Floating_layer($$anchor, $$props) {
	$.push($$props, true);

	let tooltip = $.prop($$props, 'tooltip', 3, false);

	FloatingRootState.create(tooltip());

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}