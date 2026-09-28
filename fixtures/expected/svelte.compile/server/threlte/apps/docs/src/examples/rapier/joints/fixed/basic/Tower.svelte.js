import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Collider, CollisionGroups, RigidBody } from '@threlte/rapier';
import FixedJoint from './FixedJoint.svelte';

export default function Tower($$renderer, $$props) {
	let { position = [0, 0, 0], jointed = false, color = '#FE3D00' } = $$props;
	const COUNT = 5;
	const bodies = Array.from({ length: 5 }, () => undefined);
	const allReady = $.derived(() => bodies.every(Boolean));

	function bricks($$renderer) {
		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				position,
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like({ length: 5 });

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								position: [0, 0.5 + i, 0],
								children: ($$renderer) => {
									RigidBody($$renderer, {
										get rigidBody() {
											return bodies[i];
										},

										set rigidBody($$value) {
											bodies[i] = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											Collider($$renderer, { shape: 'cuboid', args: [0.5, 0.5, 0.5] });
											$$renderer.push(`<!----> `);

											if (T.Mesh) {
												$$renderer.push('<!--[-->');

												T.Mesh($$renderer, {
													castShadow: true,
													receiveShadow: true,
													children: ($$renderer) => {
														if (T.BoxGeometry) {
															$$renderer.push('<!--[-->');
															T.BoxGeometry($$renderer, { args: [1, 1, 1] });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (T.MeshStandardMaterial) {
															$$renderer.push('<!--[-->');
															T.MeshStandardMaterial($$renderer, { color });
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

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (jointed) {
			$$renderer.push('<!--[0-->');

			CollisionGroups($$renderer, {
				memberships: [2],
				filter: [0, 1],
				children: ($$renderer) => {
					bricks($$renderer);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
			bricks($$renderer);
		}

		$$renderer.push(`<!--]--> `);

		if (jointed && allReady()) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array_1 = $.ensure_array_like(Array(COUNT - 1));

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let _ = each_array_1[i];

				FixedJoint($$renderer, {
					bodyA: bodies[i],
					bodyB: bodies[i + 1],
					anchorA: [0.5 * (i % 2 === 1 ? -1 : 1), 0.5, 0],
					anchorB: [0, -0.5, 0]
				});
			}

			$$renderer.push(`<!--]-->`);
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