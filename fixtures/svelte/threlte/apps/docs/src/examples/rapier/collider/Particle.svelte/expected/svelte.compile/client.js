import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, RigidBody } from '@threlte/rapier';
import { BoxGeometry, MeshStandardMaterial } from 'three';

const geometry = new BoxGeometry(0.25, 0.25, 0.25);
const material = new MeshStandardMaterial();
var root = $.from_html(`<!> <!>`, 1);

export default function Particle($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get position() {
				return $$props.position;
			},

			get quaternion() {
				return $$props.quaternion;
			},

			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					type: 'dynamic',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Collider(node_1, { shape: 'cuboid', args: [0.125, 0.125, 0.125] });

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								castShadow: true,
								receiveShadow: true,
								get geometry() {
									return geometry;
								},

								get material() {
									return material;
								}
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}