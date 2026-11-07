import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { initRapier } from '../../lib/initRapier.svelte.js';
import InnerWorld from './InnerWorld.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'fallback', 'children']);

export default function World($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		initRapier,
		null,
		($$anchor) => {
			InnerWorld($$anchor, $.spread_props(() => rest, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			}));
		},
		($$anchor, error) => {
			var fragment_3 = $.comment();
			var node_2 = $.first_child(fragment_3);

			$.snippet(node_2, () => $$props.fallback ?? $.noop, () => $.get(error));
			$.append($$anchor, fragment_3);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
}