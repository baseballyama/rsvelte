import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { AspectRatioRootState } from "../aspect-ratio.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'ratio',
	'children',
	'child'
]);

var root = $.from_html(`<div><!></div>`);

export default function Aspect_ratio($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		ratio = $.prop($$props, 'ratio', 3, 1),
		restProps = $.rest_props($$props, rest_excludes);

	const rootState = AspectRatioRootState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		ratio: boxWith(() => ratio())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));
	var div = root();
	let styles;
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var div_1 = root();

			$.attribute_effect(div_1, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div_1);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => styles = $.set_style(div, '', styles, {
		position: 'relative',
		width: '100%',
		'padding-bottom': `${ratio() ? 100 / ratio() : 0}%`
	}));

	$.append($$anchor, div);
	$.pop();
}