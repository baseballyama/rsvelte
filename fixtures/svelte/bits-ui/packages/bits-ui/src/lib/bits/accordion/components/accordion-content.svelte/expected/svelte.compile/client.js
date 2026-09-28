import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeProps, boxWith } from "svelte-toolbelt";
import { AccordionContentState } from "../accordion.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'child',
	'ref',
	'id',
	'forceMount',
	'children',
	'hiddenUntilFound'
]);

var root = $.from_html(`<div><!></div>`);

export default function Accordion_content($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		hiddenUntilFound = $.prop($$props, 'hiddenUntilFound', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const contentState = AccordionContentState.create({
		forceMount: boxWith(() => forceMount()),
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		hiddenUntilFound: boxWith(() => hiddenUntilFound())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...contentState.snippetProps }));

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