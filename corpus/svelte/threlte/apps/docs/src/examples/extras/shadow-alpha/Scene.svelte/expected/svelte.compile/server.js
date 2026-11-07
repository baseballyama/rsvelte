import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Float, OrbitControls, ShadowAlpha } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	let { meshOpacity, shadowOpacity } = $$props;

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [4, 4, 4],
			fov: 35,
			children: ($$renderer) => {
				OrbitControls($$renderer, {
					autoRotate: true,
					autoRotateSpeed: 0.5,
					enableDamping: true,
					'target.y': 0.8
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
			castShadow: true,
			intensity: 2,
			position: [3, 6, 3],
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024,
			'shadow.camera.left': -4,
			'shadow.camera.right': 4,
			'shadow.camera.top': 4,
			'shadow.camera.bottom': -4
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.AmbientLight) {
		$$renderer.push('<!--[-->');
		T.AmbientLight($$renderer, { intensity: 0.4 });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			receiveShadow: true,
			'rotation.x': -Math.PI / 2,
			children: ($$renderer) => {
				if (T.PlaneGeometry) {
					$$renderer.push('<!--[-->');
					T.PlaneGeometry($$renderer, { args: [10, 10] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, { color: '#f0ebe3' });
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

	Float($$renderer, {
		floatIntensity: 0.5,
		floatingRange: [0, 0.3],
		children: ($$renderer) => {
			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					castShadow: true,
					'position.y': 1.2,
					rotation: [0.4, 0.6, 0],
					children: ($$renderer) => {
						if (T.TorusKnotGeometry) {
							$$renderer.push('<!--[-->');
							T.TorusKnotGeometry($$renderer, { args: [0.6, 0.2, 128, 32] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { color: '#6c5ce7', transparent: true, opacity: meshOpacity });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);
						ShadowAlpha($$renderer, { opacity: shadowOpacity });
						$$renderer.push(`<!---->`);
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
}