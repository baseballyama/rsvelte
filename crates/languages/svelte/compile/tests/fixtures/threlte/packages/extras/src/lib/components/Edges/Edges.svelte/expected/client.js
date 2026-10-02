import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, isInstanceOf, useParent } from '@threlte/core';
import { fromStore } from 'svelte/store';
import { LineSegments } from 'three';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'thresholdAngle',
	'color',
	'ref',
	'children'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Edges($$anchor, $$props) {
	$.push($$props, true);

	let thresholdAngle = $.prop($$props, 'thresholdAngle', 3, 1),
		color = $.prop($$props, 'color', 3, '#ffffff'),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const parent = fromStore(useParent());

	const geometry = $.derived(() => {
		if (!isInstanceOf(parent.current, 'Mesh')) {
			throw new Error('Edges: component must be a child of a Mesh');
		}

		return parent.current.geometry;
	});

	const segments = new LineSegments();

	T($$anchor, $.spread_props(
		{
			get is() {
				return segments;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => [$.get(geometry), thresholdAngle()]);

					$.component(node, () => T.EdgesGeometry, ($$anchor, T_EdgesGeometry) => {
						T_EdgesGeometry($$anchor, {
							get args() {
								return $.get($0);
							}
						});
					});
				}

				var node_1 = $.sibling(node, 2);

				$.component(node_1, () => T.LineBasicMaterial, ($$anchor, T_LineBasicMaterial) => {
					T_LineBasicMaterial($$anchor, {
						get color() {
							return color();
						}
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ ref: segments }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}