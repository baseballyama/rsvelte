import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { FloatingAnchorState } from "../use-floating-layer.svelte.js";

export default function Floating_layer_anchor($$anchor, $$props) {
	$.push($$props, true);

	let tooltip = $.prop($$props, 'tooltip', 3, false);

	FloatingAnchorState.create(
		{
			id: boxWith(() => $$props.id),
			virtualEl: boxWith(() => $$props.virtualEl),
			ref: $$props.ref
		},
		tooltip()
	);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}