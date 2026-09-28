import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Environment, Grid, OrbitControls, ShadowAlpha, transitions } from '@threlte/extras';
import { fade, scale } from './transitions';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		transitions();

		let { red, blue } = $$props;

		if (red) {
			$$renderer.push('<!--[0-->');

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					castShadow: true,
					transition: scale(0),
					'position.y': 1,
					'position.x': -1.5,
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
							T.MeshStandardMaterial($$renderer, { transparent: true, color: 'red' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);
						ShadowAlpha($$renderer, {});
						$$renderer.push(`<!---->`);
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

		$$renderer.push(`<!--]--> `);

		if (blue) {
			$$renderer.push('<!--[0-->');

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					castShadow: true,
					'position.y': 1,
					'position.x': 1.5,
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

						if (T.MeshToonMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshToonMaterial($$renderer, { transparent: true, transition: fade(), color: 'blue' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);
						ShadowAlpha($$renderer, {});
						$$renderer.push(`<!---->`);
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

		$$renderer.push(`<!--]--> `);

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
		});

		$$renderer.push(`<!----> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [0, 3, 10],
				fov: 30,
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						enableDamping: true,
						target: [0, 0.8, 0],
						enableZoom: false,
						enablePan: false
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

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');

			T.DirectionalLight($$renderer, {
				position: [10, 10, 10],
				castShadow: true,
				intensity: Math.PI / 2
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.1 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Grid($$renderer, { sectionColor: '#374668', cellColor: '#374668' });
		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				receiveShadow: true,
				'position.y': -0.01,
				scale: 20,
				'rotation.x': -Math.PI / 2,
				children: ($$renderer) => {
					if (T.PlaneGeometry) {
						$$renderer.push('<!--[-->');
						T.PlaneGeometry($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#0F141F' });
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