import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ExtrudeGeometry, Shape } from 'three';
import { T } from '@threlte/core';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'args',
	'radius',
	'smoothness',
	'creaseAngle',
	'steps',
	'ref',
	'children'
]);

export default function RoundedBoxGeometry($$anchor, $$props) {
	$.push($$props, true);

	let args = $.prop($$props, 'args', 19, () => []),
		radius = $.prop($$props, 'radius', 3, 0.05),
		smoothness = $.prop($$props, 'smoothness', 3, 4),
		creaseAngle = $.prop($$props, 'creaseAngle', 3, 0.4),
		steps = $.prop($$props, 'steps', 3, 1),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const eps = 0.00001;

	const createShape = (width, height, radius0) => {
		const shape = new Shape();
		const radius = radius0 - eps;

		shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
		shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
		shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
		shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);

		return shape;
	};

	let width = $.derived(() => args()[0] ?? 1);
	let height = $.derived(() => args()[1] ?? 1);
	let depth = $.derived(() => args()[2] ?? 1);
	let shape = $.derived(() => createShape($.get(width), $.get(height), radius()));

	let params = $.derived(() => ({
		depth: $.get(depth) - radius() * 2,
		bevelEnabled: true,
		bevelSegments: smoothness() * 2,
		steps: steps(),
		bevelSize: radius() - eps,
		bevelThickness: radius(),
		curveSegments: smoothness()
	}));

	let geometry = $.derived(() => new ExtrudeGeometry($.get(shape), $.get(params)));

	$.user_pre_effect(() => {
		$.get(geometry).center();
		toCreasedNormals($.get(geometry), creaseAngle());
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return $.get(geometry);
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
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: $.get(geometry) }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}