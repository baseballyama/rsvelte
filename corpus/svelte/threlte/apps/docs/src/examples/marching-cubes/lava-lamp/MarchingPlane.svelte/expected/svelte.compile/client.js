import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { MarchingPlane } from './MarchingPlane';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function MarchingPlane_1($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	const plane = new MarchingPlane();

	T($$anchor, $.spread_props(
		{
			get is() {
				return plane;
			}
		},
		() => props,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: plane }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}