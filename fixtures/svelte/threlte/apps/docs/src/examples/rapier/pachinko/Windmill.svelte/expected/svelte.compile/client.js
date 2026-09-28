import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, RigidBody, useRevoluteJoint } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);

export default function Windmill($$anchor, $$props) {
	$.push($$props, true);

	const $rigidBodyA = () => $.store_get(rigidBodyA, '$rigidBodyA', $$stores);
	const $rigidBodyB = () => $.store_get(rigidBodyB, '$rigidBodyB', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// anchorA / anchorB both [0,0,0]: both bodies sit at `position`, joint pivots
	// around their shared origin. axis [0,0,1] spins in the XY play plane.
	const { rigidBodyA, rigidBodyB } = useRevoluteJoint([0, 0, 0], [0, 0, 0], [0, 0, 1]);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get position() {
				return $$props.position;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				RigidBody(node_1, {
					type: 'fixed',
					get rigidBody() {
						$.mark_store_binding();

						return $rigidBodyA();
					},

					set rigidBody($$value) {
						$.store_set(rigidBodyA, $$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								castShadow: true,
								get geometry() {
									return $$props.hubGeometry;
								},

								get material() {
									return $$props.hubMaterial;
								},
								rotation: [Math.PI / 2, 0, 0]
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => [0, 0, $$props.initialAngularVelocity]);

					RigidBody(node_3, {
						type: 'dynamic',
						get angularVelocity() {
							return $.get($0);
						},
						enabledTranslations: [false, false, false],
						enabledRotations: [false, false, true],
						angularDamping: 0.01,
						get rigidBody() {
							$.mark_store_binding();

							return $rigidBodyB();
						},

						set rigidBody($$value) {
							$.store_set(rigidBodyB, $$value);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							Collider(node_4, {
								shape: 'cuboid',
								args: [0.45, 0.035, 0.12],
								restitution: 0.1,
								friction: 0.01,
								density: 1
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_1) => {
								T_Mesh_1($$anchor, {
									castShadow: true,
									get geometry() {
										return $$props.barGeometry;
									},

									get material() {
										return $$props.barMaterial;
									}
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}