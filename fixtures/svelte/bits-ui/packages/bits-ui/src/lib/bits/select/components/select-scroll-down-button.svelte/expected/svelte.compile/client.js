import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SelectScrollDownButtonState } from "../select.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { Mounted } from "$lib/bits/utilities/index.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'delay',
	'child',
	'children'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Select_scroll_down_button($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		delay = $.prop($$props, 'delay', 3, () => 50),
		restProps = $.rest_props($$props, rest_excludes);

	const scrollButtonState = SelectScrollDownButtonState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		delay: boxWith(() => delay())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, scrollButtonState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Mounted(node_1, {
				get mounted() {
					return scrollButtonState.scrollButtonState.mounted;
				},

				set mounted($$value) {
					scrollButtonState.scrollButtonState.mounted = $$value;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.snippet(node_3, () => $$props.child, () => ({ props: restProps }));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var div = root();

					$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

					var node_4 = $.child(div);

					$.snippet(node_4, () => $$props.children ?? $.noop);
					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node_2, ($$render) => {
					if ($$props.child) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (scrollButtonState.canScrollDown) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}