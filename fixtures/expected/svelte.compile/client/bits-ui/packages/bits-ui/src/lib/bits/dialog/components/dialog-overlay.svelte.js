import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DialogOverlayState } from "../dialog.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'forceMount',
	'child',
	'children',
	'ref'
]);

var root = $.from_html(`<div><!></div>`);

export default function Dialog_overlay($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const overlayState = DialogOverlayState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, overlayState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => ({
							props: mergeProps($.get(mergedProps)),
							...overlayState.snippetProps
						}));

						$.snippet(node_2, () => $$props.child, () => $.get($0));
					}

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var div = root();

					$.attribute_effect(div, ($0) => ({ ...$0 }), [() => mergeProps($.get(mergedProps))]);

					var node_3 = $.child(div);

					$.snippet(node_3, () => $$props.children ?? $.noop, () => overlayState.snippetProps);
					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if ($$props.child) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (overlayState.shouldRender || forceMount()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}