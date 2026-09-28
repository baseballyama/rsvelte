import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, RigidBody } from '@threlte/rapier';
import { MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';

const geometry = new SphereGeometry(1);
const material = new MeshBasicMaterial({ color: 'red' });
var root = $.from_html(`<!> <!>`, 1);

export default function RandomMeshes($$anchor, $$props) {
	$.push($$props, true);

	let count = $.prop($$props, 'count', 3, 20),
		rangeX = $.prop($$props, 'rangeX', 19, () => [-20, 20]),
		rangeY = $.prop($$props, 'rangeY', 19, () => [-20, 20]),
		rangeZ = $.prop($$props, 'rangeZ', 19, () => [-20, 20]);

	const min = new Vector3();
	const size = new Vector3();

	const createRandomPosition = () => {
		min.set(rangeX()[0], rangeY()[0], rangeZ()[0]);
		size.set(rangeX()[1], rangeY()[1], rangeZ()[1]).sub(min);

		return new Vector3().random().multiply(size).add(min).toArray();
	};

	const bodies = $.derived(() => Array.from({ length: count() }, () => createRandomPosition()));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => $.get(bodies), (position) => position, ($$anchor, position) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return position;
				},

				children: ($$anchor, $$slotProps) => {
					RigidBody($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							Collider(node_2, { shape: 'ball', args: [0.75], mass: Math.random() * 10 });

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
								T_Mesh($$anchor, {
									get geometry() {
										return geometry;
									},

									get material() {
										return material;
									}
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}