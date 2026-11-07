import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody } from '@threlte/rapier';
import FixedJoint from './FixedJoint.svelte';

export default function Hammer($$renderer, $$props) {
	let {
		position = [0, 6, 0],
		rotation = [0, 0, Math.PI / 6],
		velocity = [0, 0, 0]
	} = $$props;

	let handle = void 0;
	let head = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position,
				rotation,
				children: ($$renderer) => {
					CollisionGroups($$renderer, {
						memberships: [1],
						filter: [0, 2],
						children: ($$renderer) => {
							if (T.Group) {
								$$renderer.push('<!--[-->');

								T.Group($$renderer, {
									position: [-0.6, 0, 0],
									children: ($$renderer) => {
										RigidBody($$renderer, {
											linearVelocity: velocity,
											get rigidBody() {
												return handle;
											},

											set rigidBody($$value) {
												handle = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												Collider($$renderer, { shape: 'cuboid', args: [1.2, 0.15, 0.15], density: 0.5 });
												$$renderer.push(`<!----> `);

												if (T.Mesh) {
													$$renderer.push('<!--[-->');

													T.Mesh($$renderer, {
														castShadow: true,
														children: ($$renderer) => {
															if (T.BoxGeometry) {
																$$renderer.push('<!--[-->');
																T.BoxGeometry($$renderer, { args: [2.4, 0.3, 0.3] });
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

							$$renderer.push(` `);

							if (T.Group) {
								$$renderer.push('<!--[-->');

								T.Group($$renderer, {
									position: [1, 0, 0],
									children: ($$renderer) => {
										RigidBody($$renderer, {
											linearVelocity: velocity,
											get rigidBody() {
												return head;
											},

											set rigidBody($$value) {
												head = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												Collider($$renderer, { shape: 'cuboid', args: [0.4, 0.4, 0.4], density: 8 });
												$$renderer.push(`<!----> `);

												if (T.Mesh) {
													$$renderer.push('<!--[-->');

													T.Mesh($$renderer, {
														castShadow: true,
														children: ($$renderer) => {
															if (T.BoxGeometry) {
																$$renderer.push('<!--[-->');
																T.BoxGeometry($$renderer, { args: [0.8, 0.8, 0.8] });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (T.MeshStandardMaterial) {
																$$renderer.push('<!--[-->');
																T.MeshStandardMaterial($$renderer, { color: '#444', metalness: 0.8, roughness: 0.3 });
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (handle && head) {
			$$renderer.push('<!--[0-->');

			FixedJoint($$renderer, {
				bodyA: handle,
				bodyB: head,
				anchorA: [1.2, 0, 0],
				anchorB: [-0.4, 0, 0]
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}