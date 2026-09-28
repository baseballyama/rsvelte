import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { IsMounted } from "runed";
import { ScrollAreaThumbImplState } from "../scroll-area.svelte.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'child',
	'children',
	'present'
]);

var root = $.from_html(`<div><!></div>`);

export default function Scroll_area_thumb_impl($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const isMounted = new IsMounted();

	const thumbState = ScrollAreaThumbImplState.create({
		id: boxWith(() => $$props.id),
		ref: boxWith(() => ref(), (v) => ref(v)),
		mounted: boxWith(() => isMounted.current)
	});

	const mergedProps = $.derived(() => mergeProps(restProps, thumbState.props, { style: { hidden: !$$props.present } }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}