import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SliderThumbState } from "../slider.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'ref',
	'id',
	'index',
	'disabled'
]);

var root = $.from_html(`<span><!></span>`);

export default function Slider_thumb($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const thumbState = SliderThumbState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		index: boxWith(() => $$props.index),
		disabled: boxWith(() => disabled())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, thumbState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({
					active: thumbState.root.isThumbActive(thumbState.opts.index.current),
					props: $.get(mergedProps)
				}));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var span = root();

			$.attribute_effect(span, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(span);

			{
				let $0 = $.derived(() => ({
					active: thumbState.root.isThumbActive(thumbState.opts.index.current)
				}));

				$.snippet(node_2, () => $$props.children ?? $.noop, () => $.get($0));
			}

			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}