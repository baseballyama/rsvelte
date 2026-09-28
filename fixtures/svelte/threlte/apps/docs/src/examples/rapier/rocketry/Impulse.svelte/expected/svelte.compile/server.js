import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { BufferGeometry, DoubleSide, Group, Mesh, Vector3 } from 'three';

export default function Impulse($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { origin, impulse, length, color, multiplier, afterTask } = $$props;
		let combinedColor = $.derived(() => color ?? 'red');
		const geometry = new BufferGeometry();
		const tempV3 = new Vector3();
		const startAtObject = new Mesh();
		const endAtObject = new Group();

		useTask(
			() => {
				const from = new Vector3(origin.x, origin.y, origin.z);

				if (length) {
					tempV3.set(impulse.x, impulse.y, impulse.z).normalize().multiplyScalar(length);
				} else {
					tempV3.set(impulse.x, impulse.y, impulse.z);
				}

				if (multiplier) {
					tempV3.multiplyScalar(multiplier);
				}

				const to = from.clone().add(tempV3);
				const points = [];

				points.push(from);
				points.push(to);
				geometry.setFromPoints(points);

				if (!startAtObject || !endAtObject) return;

				startAtObject.position.copy(from);
				endAtObject.position.copy(to);
				endAtObject.lookAt(from);
			},
			{ after: afterTask ?? [] }
		);

		if (T.Line) {
			$$renderer.push('<!--[-->');

			T.Line($$renderer, {
				renderOrder: 1,
				frustumCulled: false,
				children: ($$renderer) => {
					T($$renderer, { is: geometry });
					$$renderer.push(`<!----> `);

					if (T.LineBasicMaterial) {
						$$renderer.push('<!--[-->');

						T.LineBasicMaterial($$renderer, {
							color: combinedColor(),
							depthTest: false,
							depthWrite: false,
							side: DoubleSide,
							transparent: true,
							opacity: 1
						});

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

		T($$renderer, {
			is: startAtObject,
			frustumCulled: false,
			children: ($$renderer) => {
				if (T.SphereGeometry) {
					$$renderer.push('<!--[-->');
					T.SphereGeometry($$renderer, { args: [0.03] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshBasicMaterial($$renderer, { color: combinedColor(), depthTest: false, depthWrite: false });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		T($$renderer, {
			is: endAtObject,
			frustumCulled: false,
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
						'rotation.x': -90 * Math.PI / 180,
						children: ($$renderer) => {
							if (T.ConeGeometry) {
								$$renderer.push('<!--[-->');
								T.ConeGeometry($$renderer, { args: [0.03, 0.1] });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (T.MeshBasicMaterial) {
								$$renderer.push('<!--[-->');
								T.MeshBasicMaterial($$renderer, { color: combinedColor(), depthTest: false, depthWrite: false });
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

		$$renderer.push(`<!---->`);
	});
}