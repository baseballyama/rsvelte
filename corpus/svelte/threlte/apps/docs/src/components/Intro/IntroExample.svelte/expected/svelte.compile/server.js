import * as $ from 'svelte/internal/server';
import { Canvas, T } from '@threlte/core';
import { ContactShadows, Float, Grid, OrbitControls } from '@threlte/extras';

export default function IntroExample($$renderer, $$props) {
	let _class = '';

	$$renderer.push(`<div${$.attr_class($.clsx(_class))}>`);

	Canvas($$renderer, {
		children: ($$renderer) => {
			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [-10, 10, 10],
					fov: 15,
					children: ($$renderer) => {
						OrbitControls($$renderer, {
							autoRotate: true,
							enableZoom: false,
							enableDamping: true,
							autoRotateSpeed: 0.5,
							'target.y': 1.5
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
				T.DirectionalLight($$renderer, { intensity: 0.8, 'position.x': 5, 'position.y': 10 });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.AmbientLight) {
				$$renderer.push('<!--[-->');
				T.AmbientLight($$renderer, { intensity: 0.2 });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Grid($$renderer, {
				'position.y': -0.001,
				cellColor: '#ffffff',
				sectionColor: '#ffffff',
				sectionThickness: 0,
				fadeDistance: 25,
				cellSize: 2
			});

			$$renderer.push(`<!----> `);
			ContactShadows($$renderer, { scale: 10, blur: 2, far: 2.5, opacity: 0.5 });
			$$renderer.push(`<!----> `);

			Float($$renderer, {
				floatIntensity: 1,
				floatingRange: [0, 1],
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'position.y': 1.2,
							'position.z': -0.75,
							children: ($$renderer) => {
								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: '#0059BA' });
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

			$$renderer.push(`<!----> `);

			Float($$renderer, {
				floatIntensity: 1,
				floatingRange: [0, 1],
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							position: [1.2, 1.5, 0.75],
							'rotation.x': 5,
							'rotation.y': 71,
							children: ($$renderer) => {
								if (T.TorusKnotGeometry) {
									$$renderer.push('<!--[-->');
									T.TorusKnotGeometry($$renderer, { args: [0.5, 0.15, 100, 12, 2, 3] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: '#F85122' });
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

			$$renderer.push(`<!----> `);

			Float($$renderer, {
				floatIntensity: 1,
				floatingRange: [0, 1],
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							position: [-1.4, 1.5, 0.75],
							rotation: [-5, 128, 10],
							children: ($$renderer) => {
								if (T.IcosahedronGeometry) {
									$$renderer.push('<!--[-->');
									T.IcosahedronGeometry($$renderer, { args: [1, 0] });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: '#F8EBCE' });
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
	$.bind_props($$props, { class: _class });
}