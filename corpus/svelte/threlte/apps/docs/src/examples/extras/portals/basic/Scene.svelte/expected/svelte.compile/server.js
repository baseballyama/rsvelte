import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Grid, OrbitControls, Portal, PortalTarget } from '@threlte/extras';
import { MathUtils } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let posX = Math.sin(Date.now() / 1000) * 4;

		useTask(() => {
			posX = Math.sin(Date.now() / 1000) * 4;
		});

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				position: [10, 10, 10],
				makeDefault: true,
				fov: 30,
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						maxPolarAngle: 85 * MathUtils.DEG2RAD,
						minPolarAngle: 20 * MathUtils.DEG2RAD,
						maxAzimuthAngle: 45 * MathUtils.DEG2RAD,
						minAzimuthAngle: -45 * MathUtils.DEG2RAD,
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
		Grid($$renderer, {});
		$$renderer.push(`<!----> `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [5, 10, 3] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Object3D) {
			$$renderer.push('<!--[-->');

			T.Object3D($$renderer, {
				'position.x': posX,
				'position.y': 0.5,
				children: ($$renderer) => {
					PortalTarget($$renderer, { id: 'trail' });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Portal($$renderer, {
			id: 'trail',
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
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
								T.MeshStandardMaterial($$renderer, { color: '#FE3D00' });
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

				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						'position.y': 1,
						children: ($$renderer) => {
							PortalTarget($$renderer, { id: 'top' });
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

		Portal($$renderer, {
			id: 'top',
			children: ($$renderer) => {
				if (T.Mesh) {
					$$renderer.push('<!--[-->');

					T.Mesh($$renderer, {
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
								T.MeshStandardMaterial($$renderer, { color: '#2F7DC6' });
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