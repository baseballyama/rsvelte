import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody, useSphericalJoint } from '@threlte/rapier';

export default function Chain($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const segments = 10;
		const spacing = 0.4;
		const radius = 0.18;
		const wreckingRadius = 0.4;
		const beadDensity = 1;
		const wreckingDensity = 3;
		const wreckingOffset = radius + wreckingRadius + 0.05;
		const wreckingAnchor = wreckingOffset - spacing / 2;
		const bodies = Array.from({ length: segments + 1 }, () => undefined);
		const allReady = $.derived(() => bodies.every(Boolean));

		// Chain extends to the -x direction, so each upper-side anchor is on its left
		// surface (-x in local), each lower-side anchor on its right (+x).
		const joints = Array.from({ length: segments }, (_, i) => {
			if (i === 0) {
				return useSphericalJoint([0, 0, 0], [spacing / 2, 0, 0]);
			}

			if (i === segments - 1) {
				return useSphericalJoint([-spacing / 2, 0, 0], [wreckingAnchor, 0, 0]);
			}

			return useSphericalJoint([-spacing / 2, 0, 0], [spacing / 2, 0, 0]);
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
							position: [0, 5, 0],
							children: ($$renderer) => {
								RigidBody($$renderer, {
									type: 'fixed',
									get rigidBody() {
										return bodies[0];
									},

									set rigidBody($$value) {
										bodies[0] = $$value;
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

					$$renderer.push(` <!--[-->`);

					const each_array = $.ensure_array_like({ length: segments - 1 });

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								position: [-spacing / 2 - i * spacing, 5, 0],
								children: ($$renderer) => {
									RigidBody($$renderer, {
										linearDamping: 0.1,
										angularDamping: 0.1,
										get rigidBody() {
											return bodies[i + 1];
										},

										set rigidBody($$value) {
											bodies[i + 1] = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											Collider($$renderer, { shape: 'ball', args: [radius], density: beadDensity });
											$$renderer.push(`<!----> `);

											if (T.Mesh) {
												$$renderer.push('<!--[-->');

												T.Mesh($$renderer, {
													castShadow: true,
													children: ($$renderer) => {
														if (T.SphereGeometry) {
															$$renderer.push('<!--[-->');
															T.SphereGeometry($$renderer, { args: [radius, 16, 12] });
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
					}

					$$renderer.push(`<!--]--> `);

					if (T.Group) {
						$$renderer.push('<!--[-->');

						T.Group($$renderer, {
							position: [
								-spacing / 2 - (segments - 2) * spacing - wreckingOffset,
								5,
								0
							],

							children: ($$renderer) => {
								RigidBody($$renderer, {
									linearDamping: 0.1,
									angularDamping: 0.1,
									get rigidBody() {
										return bodies[segments];
									},

									set rigidBody($$value) {
										bodies[segments] = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										Collider($$renderer, {
											shape: 'ball',
											args: [wreckingRadius],
											density: wreckingDensity
										});

										$$renderer.push(`<!----> `);

										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												children: ($$renderer) => {
													if (T.SphereGeometry) {
														$$renderer.push('<!--[-->');
														T.SphereGeometry($$renderer, { args: [wreckingRadius, 24, 16] });
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
	});
}