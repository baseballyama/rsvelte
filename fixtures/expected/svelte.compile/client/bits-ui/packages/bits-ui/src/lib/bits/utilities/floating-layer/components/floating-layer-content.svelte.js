import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { FloatingContentState } from "../use-floating-layer.svelte.js";
import { useId } from "$lib/internal/use-id.js";

export default function Floating_layer_content($$anchor, $$props) {
	$.push($$props, true);

	let side = $.prop($$props, 'side', 3, "bottom"),
		sideOffset = $.prop($$props, 'sideOffset', 3, 0),
		align = $.prop($$props, 'align', 3, "center"),
		alignOffset = $.prop($$props, 'alignOffset', 3, 0),
		arrowPadding = $.prop($$props, 'arrowPadding', 3, 0),
		avoidCollisions = $.prop($$props, 'avoidCollisions', 3, true),
		collisionBoundary = $.prop($$props, 'collisionBoundary', 19, () => []),
		collisionPadding = $.prop($$props, 'collisionPadding', 3, 0),
		hideWhenDetached = $.prop($$props, 'hideWhenDetached', 3, false),
		onPlaced = $.prop($$props, 'onPlaced', 3, () => {}),
		sticky = $.prop($$props, 'sticky', 3, "partial"),
		updatePositionStrategy = $.prop($$props, 'updatePositionStrategy', 3, "optimized"),
		strategy = $.prop($$props, 'strategy', 3, "fixed"),
		dir = $.prop($$props, 'dir', 3, "ltr"),
		style = $.prop($$props, 'style', 19, () => ({})),
		wrapperId = $.prop($$props, 'wrapperId', 19, useId),
		customAnchor = $.prop($$props, 'customAnchor', 3, null),
		tooltip = $.prop($$props, 'tooltip', 3, false);

	const contentState = FloatingContentState.create(
		{
			side: boxWith(() => side()),
			sideOffset: boxWith(() => sideOffset()),
			align: boxWith(() => align()),
			alignOffset: boxWith(() => alignOffset()),
			id: boxWith(() => $$props.id),
			arrowPadding: boxWith(() => arrowPadding()),
			avoidCollisions: boxWith(() => avoidCollisions()),
			collisionBoundary: boxWith(() => collisionBoundary()),
			collisionPadding: boxWith(() => collisionPadding()),
			hideWhenDetached: boxWith(() => hideWhenDetached()),
			onPlaced: boxWith(() => onPlaced()),
			sticky: boxWith(() => sticky()),
			updatePositionStrategy: boxWith(() => updatePositionStrategy()),
			strategy: boxWith(() => strategy()),
			dir: boxWith(() => dir()),
			style: boxWith(() => style()),
			enabled: boxWith(() => $$props.enabled),
			wrapperId: boxWith(() => wrapperId()),
			customAnchor: boxWith(() => customAnchor())
		},
		tooltip()
	);

	const mergedProps = $.derived(() => mergeProps(contentState.wrapperProps, { style: { pointerEvents: "auto" } }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.content ?? $.noop, () => ({ props: contentState.props, wrapperProps: $.get(mergedProps) }));
	$.append($$anchor, fragment);
	$.pop();
}