import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { AutoColliders, Collider, RigidBody } from '@threlte/rapier';
import { Vector3 } from 'three';
import TestBed from './TestBed.svelte';

export default function AttachedCollider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let rigidBody = void 0;
		const position = new Vector3(0, 1, 0);
		let elapsed = 0;

		useTask((dt) => {
			elapsed += dt;
			position.x = Math.sin(elapsed);
			position.z = Math.cos(elapsed);
			rigidBody?.setNextKinematicTranslation(position);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [0, 2, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							children: ($$renderer) => {
								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										castShadow: true,
										children: ($$renderer) => {
											if (T.MeshStandardMaterial) {
												$$renderer.push('<!--[-->');
												T.MeshStandardMaterial($$renderer, { color: 0xff3f00 });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (T.BoxGeometry) {
												$$renderer.push('<!--[-->');
												T.BoxGeometry($$renderer, { args: [2, 2, 2] });
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
								Collider($$renderer, { shape: 'cuboid', args: [1, 1, 1] });
								$$renderer.push(`<!---->`);
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
					position: [0, 1, 0],
					children: ($$renderer) => {
						RigidBody($$renderer, {
							type: 'kinematicPosition',
							lockRotations: true,
							get rigidBody() {
								return rigidBody;
							},

							set rigidBody($$value) {
								rigidBody = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								AutoColliders($$renderer, {
									shape: 'ball',
									children: ($$renderer) => {
										if (T.Mesh) {
											$$renderer.push('<!--[-->');

											T.Mesh($$renderer, {
												castShadow: true,
												children: ($$renderer) => {
													if (T.SphereGeometry) {
														$$renderer.push('<!--[-->');
														T.SphereGeometry($$renderer, { args: [1] });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (T.MeshStandardMaterial) {
														$$renderer.push('<!--[-->');
														T.MeshStandardMaterial($$renderer, {});
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			{
				function text($$renderer) {
					$$renderer.push(`<div><p>Nesting one or multiple &lt;Collider> components in a &lt;RigidBody> component effectively attaches
        the colliders to the rigid body and allow the rigid body to be affected by contact forces and
        gravity.</p></div>`);
				}

				TestBed($$renderer, { title: 'Attached Collider', text, $$slots: { text: true } });
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}