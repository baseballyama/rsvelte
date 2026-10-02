import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Shape, ShapeGeometry } from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function RoundedPlane($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, 'white'),
		height = $.prop($$props, 'height', 3, 1),
		width = $.prop($$props, 'width', 3, 1),
		radius = $.prop($$props, 'radius', 3, 5),
		depth = $.prop($$props, 'depth', 3, 0);

	let x = 1;
	let y = 1;

	const createGeometry = (width, height, radius) => {
		let shape = new Shape();

		shape.moveTo(x, y + radius);
		shape.lineTo(x, y + height - radius);
		shape.quadraticCurveTo(x, y + height, x + radius, y + height);
		shape.lineTo(x + width - radius, y + height);
		shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
		shape.lineTo(x + width, y + radius);
		shape.quadraticCurveTo(x + width, y, x + width - radius, y);
		shape.lineTo(x + radius, y);
		shape.quadraticCurveTo(x, y, x, y + radius);

		const geometry = new ShapeGeometry(shape);

		geometry.center();

		return geometry;
	};

	let geometry = $.derived(() => createGeometry(width(), height(), radius()));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => depth() * 20);

		$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				get 'position.z'() {
					return $.get($0);
				},

				get renderOrder() {
					return depth();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					T(node_1, {
						get is() {
							return $.get(geometry);
						}
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
						T_MeshBasicMaterial($$anchor, {
							get color() {
								return color();
							}
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}