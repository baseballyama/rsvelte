import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandItemState } from "../command.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'value',
	'disabled',
	'children',
	'child',
	'onSelect',
	'forceMount',
	'keywords'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div style="display: contents;" data-item-wrapper=""><!></div>`);

export default function Command_item($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		onSelect = $.prop($$props, 'onSelect', 3, noop),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		keywords = $.prop($$props, 'keywords', 19, () => []),
		restProps = $.rest_props($$props, rest_excludes);

	const itemState = CommandItemState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		value: boxWith(() => value()),
		disabled: boxWith(() => disabled()),
		onSelect: boxWith(() => onSelect()),
		forceMount: boxWith(() => forceMount()),
		keywords: boxWith(() => keywords())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, itemState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => itemState.root.key, ($$anchor) => {
		var div = root_1();
		var node_1 = $.child(div);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						$.snippet(node_3, () => $$props.child, () => ({ props: $.get(mergedProps) }));
						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var div_1 = root();

						$.attribute_effect(div_1, () => ({ ...$.get(mergedProps) }));

						var node_4 = $.child(div_1);

						$.snippet(node_4, () => $$props.children ?? $.noop);
						$.reset(div_1);
						$.append($$anchor, div_1);
					};

					$.if(node_2, ($$render) => {
						if ($$props.child) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			};

			$.if(node_1, ($$render) => {
				if (itemState.shouldRender) $$render(consequent_1);
			});
		}

		$.reset(div);
		$.template_effect(() => $.set_attribute(div, 'data-value', itemState.trueValue));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
}