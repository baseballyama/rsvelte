import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NavigationMenuViewportState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { getDataTransitionAttrs } from "$lib/internal/attrs.js";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";
import { boxWith, mergeProps } from "svelte-toolbelt";
import { Mounted } from "$lib/bits/utilities/index.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'forceMount',
	'child',
	'children'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Navigation_menu_viewport($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const viewportState = NavigationMenuViewportState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, viewportState.props));

	{
		const presence = ($$anchor, $$arg0) => {
			let transitionStatus = () => ($$arg0?.()).transitionStatus;
			const presenceProps = $.derived(() => getDataTransitionAttrs(transitionStatus()));
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => ({ props: mergeProps($.get(mergedProps), $.get(presenceProps)) }));

						$.snippet(node_1, () => $$props.child, () => $.get($0));
					}

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var div = root();

					$.attribute_effect(div, ($0) => ({ ...$0 }), [() => mergeProps($.get(mergedProps), $.get(presenceProps))]);

					var node_2 = $.child(div);

					$.snippet(node_2, () => $$props.children ?? $.noop);
					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if ($$props.child) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_3 = $.sibling(node, 2);

			Mounted(node_3, {
				get mounted() {
					return viewportState.mounted;
				},

				set mounted($$value) {
					viewportState.mounted = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => forceMount() || viewportState.open);

		PresenceLayer($$anchor, {
			get open() {
				return $.get($0);
			},

			get ref() {
				return viewportState.opts.ref;
			},
			presence,
			$$slots: { presence: true }
		});
	}

	$.pop();
}