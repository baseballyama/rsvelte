import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Group, Vector3 } from 'three';
import { useRapier } from '../../hooks/useRapier.js';

export default function Attractor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			strength = 1,
			range = 50,
			gravityType = 'static',
			gravitationalConstant = 6.673e-11,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const { world, debug } = useRapier();
		const gravitySource = new Vector3();
		const group = new Group();

		const calcForceByType = {
			static: (s, _m2, _r, _d, _G) => s,
			linear: (s, _m2, r, d, _G) => s * (d / r),
			newtonian: (s, m2, _r, d, G) => G * s * m2 / Math.pow(d, 2)
		};

		const impulseVector = new Vector3();
		const bodyV3 = new Vector3();

		function applyImpulseToBodiesInRange() {
			group.getWorldPosition(gravitySource);

			const calcForce = calcForceByType[gravityType];
			const rangeSquared = range * range;
			const isNewtonian = gravityType === 'newtonian';

			world.forEachRigidBody((body) => {
				const { x, y, z } = body.translation();

				bodyV3.set(x, y, z);

				const distance = gravitySource.distanceToSquared(bodyV3);

				if (distance < rangeSquared) {
					let force = calcForce(strength, isNewtonian ? body.mass() : 0, range, distance, gravitationalConstant);

					// Prevent wild forces when Attractors collide
					force = force === Infinity ? strength : force;

					impulseVector.subVectors(gravitySource, bodyV3).normalize().multiplyScalar(force);
					body.applyImpulse(impulseVector, true);
				}
			});
		}

		useTask(() => {
			applyImpulseToBodiesInRange();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: group },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: group });
						$$renderer.push(`<!----> `);

						if ($.store_get($$store_subs ??= {}, '$debug', debug)) {
							$$renderer.push('<!--[0-->');

							if (T.Mesh) {
								$$renderer.push('<!--[-->');

								T.Mesh($$renderer, {
									children: ($$renderer) => {
										if (T.SphereGeometry) {
											$$renderer.push('<!--[-->');
											T.SphereGeometry($$renderer, { args: [range] });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (T.MeshBasicMaterial) {
											$$renderer.push('<!--[-->');
											T.MeshBasicMaterial($$renderer, { wireframe: true, transparent: true, opacity: 0.25 });
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
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}