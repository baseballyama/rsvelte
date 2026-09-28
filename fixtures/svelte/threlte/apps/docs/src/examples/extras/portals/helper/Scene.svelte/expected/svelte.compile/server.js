import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { Grid, OrbitControls, TransformControls } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { scene } = useThrelte();

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				position: [10, 10, 10],
				makeDefault: true,
				fov: 30,
				children: ($$renderer) => {
					OrbitControls($$renderer, { enableZoom: false });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Grid($$renderer, {});
		$$renderer.push(`<!----> `);

		{
			function children($$renderer, { ref }) {
				{
					function children($$renderer, { ref: helperA }) {
						TransformControls($$renderer, { object: ref, onobjectChange: () => helperA.update() });
					}

					if (T.DirectionalLightHelper) {
						$$renderer.push('<!--[-->');

						T.DirectionalLightHelper($$renderer, {
							attach: scene,
							args: [ref],
							children,
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			if (T.DirectionalLight) {
				$$renderer.push('<!--[-->');

				T.DirectionalLight($$renderer, {
					color: '#FE3D00',
					intensity: 1,
					position: [1.5, 2, 0.5],
					children,
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(` `);

		{
			function children($$renderer, { ref }) {
				{
					function children($$renderer, { ref: helperB }) {
						TransformControls($$renderer, { object: ref, onobjectChange: () => helperB.update() });
					}

					if (T.DirectionalLightHelper) {
						$$renderer.push('<!--[-->');

						T.DirectionalLightHelper($$renderer, {
							attach: scene,
							args: [ref],
							children,
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			if (T.DirectionalLight) {
				$$renderer.push('<!--[-->');

				T.DirectionalLight($$renderer, {
					intensity: 0.5,
					color: '#2F7DC6',
					position: [-1, -2, 1],
					children,
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'position.y': 0.5,
				children: ($$renderer) => {
					if (T.SphereGeometry) {
						$$renderer.push('<!--[-->');
						T.SphereGeometry($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: 'white' });
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
	});
}