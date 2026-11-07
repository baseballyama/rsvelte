import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CollapsibleContentState } from "../collapsible.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'child',
	'ref',
	'forceMount',
	'hiddenUntilFound',
	'children',
	'id'
]);

var root = $.from_html(`<div><!></div>`);

export default function Collapsible_content($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		hiddenUntilFound = $.prop($$props, 'hiddenUntilFound', 3, false),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		restProps = $.rest_props($$props, rest_excludes);

	const contentState = CollapsibleContentState.create({
		id: boxWith(() => id()),
		forceMount: boxWith(() => forceMount()),
		hiddenUntilFound: boxWith(() => hiddenUntilFound()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ ...contentState.snippetProps, props: $.get(mergedProps) }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

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