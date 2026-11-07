import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { BufferAttribute, BufferGeometry, LineSegments } from 'three';
import { useRapier } from '../../hooks/useRapier.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<!> <!>`, 1);

export default function Debug($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 27, () => $.proxy(new LineSegments())),
		props = $.rest_props($$props, rest_excludes);

	const { world, debug } = useRapier();
	const geometry = new BufferGeometry();
	let positionAttribute = new BufferAttribute(new Float32Array(0), 3);
	let colorAttribute = new BufferAttribute(new Float32Array(0), 4);

	geometry.setAttribute('position', positionAttribute);
	geometry.setAttribute('color', colorAttribute);

	useTask(() => {
		const { vertices, colors } = world.debugRender();

		if (positionAttribute.array.length === vertices.length) {
			positionAttribute.array.set(vertices);
			colorAttribute.array.set(colors);
			positionAttribute.needsUpdate = true;
			colorAttribute.needsUpdate = true;
		} else {
			// rapier returns matched vertex/color counts, so they always resize together
			geometry.dispose();

			positionAttribute = new BufferAttribute(vertices, 3);
			colorAttribute = new BufferAttribute(colors, 4);
			geometry.setAttribute('position', positionAttribute);
			geometry.setAttribute('color', colorAttribute);
		}
	});

	$.user_effect(() => {
		debug.set(true);

		return () => {
			debug.set(false);
			geometry.dispose();
		};
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return ref();
			},
			frustumCulled: false,
			renderOrder: Infinity
		},
		() => props,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				T(node, {
					get is() {
						return geometry;
					}
				});

				var node_1 = $.sibling(node, 2);

				$.component(node_1, () => T.LineBasicMaterial, ($$anchor, T_LineBasicMaterial) => {
					T_LineBasicMaterial($$anchor, { vertexColors: true });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}