import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody, useRevoluteJoint } from '@threlte/rapier';

export default function Pendulum($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { rigidBodyA, rigidBodyB } = useRevoluteJoint([0, 0, 0], [0, 2, 0], [0, 0, 1]);
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
							position: [0, 6, 0],
							children: ($$renderer) => {
								RigidBody($$renderer, {
									type: 'fixed',
									get rigidBody() {
										return $.store_get($$store_subs ??= {}, '$rigidBodyA', rigidBodyA);
									},

									set rigidBody($$value) {
										$.store_set(rigidBodyA, $$value);
										$$settled = false;
									},

									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												children: ($$renderer) => {
													if (T.BoxGeometry) {
														$$renderer.push('<!--[-->');
														T.BoxGeometry($$renderer, { args: [0.3, 0.3, 0.3] });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, { color: '#222' });
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
							position: [1.732, 5, 0],
							rotation: [0, 0, Math.PI / 3],
							children: ($$renderer) => {
								RigidBody($$renderer, {
									get rigidBody() {
										return $.store_get($$store_subs ??= {}, '$rigidBodyB', rigidBodyB);
									},

									set rigidBody($$value) {
										$.store_set(rigidBodyB, $$value);
										$$settled = false;
									},

									children: ($$renderer) => {
										Collider($$renderer, { shape: 'cuboid', args: [0.2, 1.5, 0.2], density: 1 });
										$$renderer.push(`<!----> `);

										if (T.Group) {
											$$renderer.push('<!--[-->');

											T.Group($$renderer, {
												'position.y': -1.7,
												children: ($$renderer) => {
													Collider($$renderer, { shape: 'ball', args: [0.5], density: 20 });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												children: ($$renderer) => {
													if (T.BoxGeometry) {
														$$renderer.push('<!--[-->');
														T.BoxGeometry($$renderer, { args: [0.4, 3, 0.4] });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, { color: '#8B5A2B' });
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

										$$renderer.push(` `);

										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												'position.y': -1.7,
												children: ($$renderer) => {
													if (T.SphereGeometry) {
														$$renderer.push('<!--[-->');
														T.SphereGeometry($$renderer, { args: [0.5, 24, 16] });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, { color: '#222', metalness: 0.8, roughness: 0.3 });
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}