import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ScrollAreaViewportState } from "../scroll-area.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'id', 'children']);
var root = $.from_html(`<div><div><!></div></div>`);

export default function Scroll_area_viewport($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		restProps = $.rest_props($$props, rest_excludes);

	const viewportState = ScrollAreaViewportState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, viewportState.props));
	const mergedContentProps = $.derived(() => mergeProps({}, viewportState.contentProps));
	var div = root();

	$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

	var div_1 = $.child(div);

	$.attribute_effect(div_1, () => ({ ...$.get(mergedContentProps) }));

	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}