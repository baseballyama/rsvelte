import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PaginationRootState } from "../pagination.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'count',
	'perPage',
	'page',
	'ref',
	'siblingCount',
	'onPageChange',
	'loop',
	'orientation',
	'child',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Pagination($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		perPage = $.prop($$props, 'perPage', 3, 1),
		page = $.prop($$props, 'page', 15, 1),
		ref = $.prop($$props, 'ref', 15, null),
		siblingCount = $.prop($$props, 'siblingCount', 3, 1),
		onPageChange = $.prop($$props, 'onPageChange', 3, noop),
		loop = $.prop($$props, 'loop', 3, false),
		orientation = $.prop($$props, 'orientation', 3, "horizontal"),
		restProps = $.rest_props($$props, rest_excludes);

	const rootState = PaginationRootState.create({
		id: boxWith(() => id()),
		count: boxWith(() => $$props.count),
		perPage: boxWith(() => perPage()),
		page: boxWith(() => page(), (v) => {
			page(v);
			onPageChange()?.(v);
		}),
		loop: boxWith(() => loop()),
		siblingCount: boxWith(() => siblingCount()),
		orientation: boxWith(() => orientation()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...rootState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => rootState.snippetProps);
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