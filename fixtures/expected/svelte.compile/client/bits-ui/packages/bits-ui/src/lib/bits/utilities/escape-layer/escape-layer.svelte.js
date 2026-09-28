import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { EscapeLayerState } from "./use-escape-layer.svelte.js";
import { noop } from "$lib/internal/noop.js";

export default function Escape_layer($$anchor, $$props) {
	$.push($$props, true);

	let escapeKeydownBehavior = $.prop($$props, 'escapeKeydownBehavior', 3, "close"),
		onEscapeKeydown = $.prop($$props, 'onEscapeKeydown', 3, noop);

	EscapeLayerState.create({
		escapeKeydownBehavior: boxWith(() => escapeKeydownBehavior()),
		onEscapeKeydown: boxWith(() => onEscapeKeydown()),
		enabled: boxWith(() => $$props.enabled),
		ref: $$props.ref
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}