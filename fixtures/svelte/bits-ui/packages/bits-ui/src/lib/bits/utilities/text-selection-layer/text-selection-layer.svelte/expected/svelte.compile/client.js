import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { TextSelectionLayerState } from "./use-text-selection-layer.svelte.js";
import { noop } from "$lib/internal/noop.js";

export default function Text_selection_layer($$anchor, $$props) {
	$.push($$props, true);

	let preventOverflowTextSelection = $.prop($$props, 'preventOverflowTextSelection', 3, true),
		onPointerDown = $.prop($$props, 'onPointerDown', 3, noop),
		onPointerUp = $.prop($$props, 'onPointerUp', 3, noop);

	TextSelectionLayerState.create({
		id: boxWith(() => $$props.id),
		onPointerDown: boxWith(() => onPointerDown()),
		onPointerUp: boxWith(() => onPointerUp()),
		enabled: boxWith(() => $$props.enabled && preventOverflowTextSelection()),
		ref: $$props.ref
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}