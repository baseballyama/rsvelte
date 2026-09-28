import * as $ from 'svelte/internal/server';
import { Environment, OrbitControls, Suspense } from '@threlte/extras';
import { GroundedSkybox } from 'three/examples/jsm/Addons.js';
import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { useGround = true } = $$props;
		let skybox = void 0;
		const groundOptions = { height: 15, radius: 100 };
		const ground = $.derived(() => useGround === false ? useGround : groundOptions);
		const radius = 0.5;
		const y = groundOptions.height - radius - 0.1;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Suspense($$renderer, {
				children: ($$renderer) => {
					if (T.PerspectiveCamera) {
						$$renderer.push('<!--[-->');

						T.PerspectiveCamera($$renderer, {
							makeDefault: true,
							'position.x': 5,
							'position.y': 2,
							'position.z': 5,
							children: ($$renderer) => {
								OrbitControls($$renderer, {
									maxDistance: 20,
									maxPolarAngle: 0.5 * Math.PI,
									enableDamping: true,
									enableZoom: false
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

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'rotation.x': 0.5 * Math.PI,
							children: ($$renderer) => {
								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { metalness: 1 });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.TorusGeometry) {
									$$renderer.push('<!--[-->');
									T.TorusGeometry($$renderer, { args: [2, radius] });
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

					Environment($$renderer, {
						isBackground: true,
						url: '/textures/equirectangular/hdr/blouberg_sunrise_2_1k.hdr',
						ground: ground(),
						get skybox() {
							return skybox;
						},

						set skybox($$value) {
							skybox = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
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