import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody, usePrismaticJoint } from '@threlte/rapier';

export default function Press($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let rail = void 0;
		let platform = void 0;
		const { rigidBodyA, rigidBodyB } = usePrismaticJoint([0, 0, 0], [0, 0, 0], [0, 1, 0], [-2.5, 2.5]);
		const PUMP_INTERVAL = 1.4;
		let elapsed = 0;

		useTask((delta) => {
			if (!platform) return;

			elapsed += delta;

			if (elapsed >= PUMP_INTERVAL) {
				elapsed = 0;
				platform.applyImpulse({ x: 0, y: 70, z: 0 }, true);
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CollisionGroups($$renderer, {
				memberships: [1],
				filter: [0],
				children: ($$renderer) => {
					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							position: [0, 3, 0],
							children: ($$renderer) => {
								RigidBody($$renderer, {
									type: 'fixed',
									get rigidBody() {
										return rail;
									},

									set rigidBody($$value) {
										rail = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										Collider($$renderer, { shape: 'cuboid', args: [0.15, 3, 0.15] });
										$$renderer.push(`<!----> `);

										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												children: ($$renderer) => {
													if (T.BoxGeometry) {
														$$renderer.push('<!--[-->');
														T.BoxGeometry($$renderer, { args: [0.3, 6, 0.3] });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, { color: '#444', metalness: 0.7, roughness: 0.3 });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							position: [0, 0.5, 0],
							children: ($$renderer) => {
								RigidBody($$renderer, {
									get rigidBody() {
										return platform;
									},

									set rigidBody($$value) {
										platform = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										Collider($$renderer, {
											shape: 'cuboid',
											args: [1.5, 0.2, 1],
											density: 5,
											friction: 1.5
										});

										$$renderer.push(`<!----> `);

										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												receiveShadow: true,
												children: ($$renderer) => {
													if (T.BoxGeometry) {
														$$renderer.push('<!--[-->');
														T.BoxGeometry($$renderer, { args: [3, 0.4, 2] });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, { color: '#222', metalness: 0.6, roughness: 0.4 });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
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