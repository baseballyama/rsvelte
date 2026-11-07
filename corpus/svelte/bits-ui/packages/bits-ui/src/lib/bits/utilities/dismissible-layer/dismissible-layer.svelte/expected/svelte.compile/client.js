import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { DismissibleLayerState } from "./use-dismissable-layer.svelte.js";
import { noop } from "$lib/internal/noop.js";

export default function Dismissible_layer($$anchor, $$props) {
	$.push($$props, true);

	let interactOutsideBehavior = $.prop($$props, 'interactOutsideBehavior', 3, "close"),
		onInteractOutside = $.prop($$props, 'onInteractOutside', 3, noop),
		onFocusOutside = $.prop($$props, 'onFocusOutside', 3, noop),
		isValidEvent = $.prop($$props, 'isValidEvent', 3, () => false);

	const dismissibleLayerState = DismissibleLayerState.create({
		id: boxWith(() => $$props.id),
		interactOutsideBehavior: boxWith(() => interactOutsideBehavior()),
		onInteractOutside: boxWith(() => onInteractOutside()),
		enabled: boxWith(() => $$props.enabled),
		onFocusOutside: boxWith(() => onFocusOutside()),
		isValidEvent: boxWith(() => isValidEvent()),
		ref: $$props.ref
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ props: dismissibleLayerState.props }));
	$.append($$anchor, fragment);
	$.pop();
}