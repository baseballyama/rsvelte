import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { CommandLabelState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { mergeProps } from "svelte-toolbelt";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'id', 'ref', 'children']);
var root = $.from_html(`<label><!></label>`);

export default function _command_label($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const labelState = CommandLabelState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, labelState.props));
	var label = root();

	$.attribute_effect(label, () => ({ ...$.get(mergedProps) }));

	var node = $.child(label);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(label);
	$.append($$anchor, label);
	$.pop();
}