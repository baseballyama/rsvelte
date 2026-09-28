import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { FloatingArrowState } from "../use-floating-layer.svelte.js";
import { Arrow } from "$lib/bits/utilities/arrow/index.js";
import { useId } from "$lib/internal/use-id.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'id', 'ref']);

export default function Floating_layer_arrow($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useId),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const arrowState = FloatingArrowState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, arrowState.props));

	Arrow($$anchor, $.spread_props(() => $.get(mergedProps)));
	$.pop();
}