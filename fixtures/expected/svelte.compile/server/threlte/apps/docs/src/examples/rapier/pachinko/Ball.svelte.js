import * as $ from 'svelte/internal/server';
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

export default function Ball($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id, position, linearVelocity } = $$props;
		let collider = void 0;
		let rigidBody = void 0;

		// Stable handler — created once per instance.
		const despawn = () => spawnQueue.despawn(id);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CollisionGroups($$renderer, {
				memberships: [1],
				filter: [0, 1],
				children: ($$renderer) => {
					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							position,
							children: ($$renderer) => {
								RigidBody($$renderer, {
									type: 'dynamic',
									enabledTranslations,
									enabledRotations,
									linearDamping: 0.05,
									angularDamping: 0.4,
									ccd: true,
									onsleep: despawn,
									get rigidBody() {
										return rigidBody;
									},

									set rigidBody($$value) {
										rigidBody = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										Collider($$renderer, {
											shape: 'ball',
											args: [0.14],
											restitution: 0.55,
											friction: 0.15,
											density: 3,
											get collider() {
												return collider;
											},

											set collider($$value) {
												collider = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										if (T.Mesh) {
											$$renderer.push('<!--[-->');
											T.Mesh($$renderer, { castShadow: true, geometry, material });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}