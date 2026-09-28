import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody } from '@threlte/rapier';
import { MeshStandardMaterial, SphereGeometry } from 'three';
import { untrack } from 'svelte';
import { ballRegistry } from './gameState.svelte';
import { spawnQueue } from './spawnQueue.svelte';

const geometry = new SphereGeometry(0.14, 16, 12);
const material = new MeshStandardMaterial({ color: '#e8e6f0', metalness: 0.9, roughness: 0.18 });
const enabledTranslations = [true, true, false];
const enabledRotations = [false, false, true];
var root = $.from_html(`<!> <!>`, 1);

export default function Ball($$anchor, $$props) {
	$.push($$props, true);

	let collider = $.state(void 0);
	let rigidBody = $.state(void 0);

	// Stable handler — created once per instance.
	const despawn = () => spawnQueue.despawn($$props.id);

	$.user_effect(() => {
		untrack(() => {
			$.get(rigidBody)?.setLinvel(
				{
					x: $$props.linearVelocity[0],
					y: $$props.linearVelocity[1],
					z: 0
				},
				true
			);
		});
	});

	$.user_effect(() => {
		if (!$.get(collider)) return;

		const { handle } = $.get(collider);

		ballRegistry.set(handle, despawn);

		return () => {
			ballRegistry.delete(handle);
		};
	});

	CollisionGroups($$anchor, {
		memberships: [1],
		filter: [0, 1],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					get position() {
						return $$props.position;
					},

					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							type: 'dynamic',
							get enabledTranslations() {
								return enabledTranslations;
							},

							get enabledRotations() {
								return enabledRotations;
							},
							linearDamping: 0.05,
							angularDamping: 0.4,
							ccd: true,
							onsleep: despawn,
							get rigidBody() {
								return $.get(rigidBody);
							},

							set rigidBody($$value) {
								$.set(rigidBody, $$value);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_1 = $.first_child(fragment_3);

								Collider(node_1, {
									shape: 'ball',
									args: [0.14],
									restitution: 0.55,
									friction: 0.15,
									density: 3,
									get collider() {
										return $.get(collider);
									},

									set collider($$value) {
										$.set(collider, $$value);
									}
								});

								var node_2 = $.sibling(node_1, 2);

								$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										castShadow: true,
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
		},
		$$slots: { default: true }
	});

	$.pop();
}