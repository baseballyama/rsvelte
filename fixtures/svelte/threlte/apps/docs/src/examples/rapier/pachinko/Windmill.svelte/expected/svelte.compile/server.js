import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Collider, RigidBody, useRevoluteJoint } from '@threlte/rapier';

export default function Windmill($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			position,
			initialAngularVelocity,
			barGeometry,
			barMaterial,
			hubGeometry,
			hubMaterial
		} = $$props;

		// anchorA / anchorB both [0,0,0]: both bodies sit at `position`, joint pivots
		// around their shared origin. axis [0,0,1] spins in the XY play plane.
		const { rigidBodyA, rigidBodyB } = useRevoluteJoint([0, 0, 0], [0, 0, 0], [0, 0, 1]);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position,
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
										castShadow: true,
										geometry: hubGeometry,
										material: hubMaterial,
										rotation: [Math.PI / 2, 0, 0]
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						RigidBody($$renderer, {
							type: 'dynamic',
							angularVelocity: [0, 0, initialAngularVelocity],
							enabledTranslations: [false, false, false],
							enabledRotations: [false, false, true],
							angularDamping: 0.01,
							get rigidBody() {
								return $.store_get($$store_subs ??= {}, '$rigidBodyB', rigidBodyB);
							},

							set rigidBody($$value) {
								$.store_set(rigidBodyB, $$value);
								$$settled = false;
							},

							children: ($$renderer) => {
								Collider($$renderer, {
									shape: 'cuboid',
									args: [0.45, 0.035, 0.12],
									restitution: 0.1,
									friction: 0.01,
									density: 1
								});

								$$renderer.push(`<!----> `);

								if (T.Mesh) {
									$$renderer.push('<!--[-->');

									T.Mesh($$renderer, {
										castShadow: true,
										geometry: barGeometry,
										material: barMaterial
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
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