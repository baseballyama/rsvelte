import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Grid, OrbitControls, Sky, AnimatedSpriteMaterial } from '@threlte/extras';

export default function Scene($$renderer) {
	if (T.OrthographicCamera) {
		$$renderer.push('<!--[-->');

		T.OrthographicCamera($$renderer, {
			makeDefault: true,
			near: -100,
			far: 100,
			zoom: 150,
			position: [5, 1.5, 3],
			oncreate: (ref) => ref.lookAt(0, 0, 0),
			children: ($$renderer) => {
				OrbitControls($$renderer, {
					enableDamping: true,
					enablePan: false,
					enableZoom: false,
					maxPolarAngle: Math.PI / 2.5,
					minPolarAngle: Math.PI / 6
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
	Sky($$renderer, {});
	$$renderer.push(`<!----> `);

	Grid($$renderer, {
		'position.y': 0.001,
		type: 'polar',
		fadeDistance: 10,
		infiniteGrid: true
	});

	$$renderer.push(`<!----> `);

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			'position.y': 1,
			'position.x': -2,
			castShadow: true,
			receiveShadow: true,
			children: ($$renderer) => {
				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, { color: 'white' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.SphereGeometry) {
					$$renderer.push('<!--[-->');
					T.SphereGeometry($$renderer, {});
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

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			receiveShadow: true,
			'rotation.x': -Math.PI / 2,
			children: ($$renderer) => {
				if (T.PlaneGeometry) {
					$$renderer.push('<!--[-->');
					T.PlaneGeometry($$renderer, { args: [1000, 1000] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, {});
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

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			'position.y': 0.5,
			'rotation.y': Math.PI / 2,
			castShadow: true,
			receiveShadow: true,
			children: ($$renderer) => {
				AnimatedSpriteMaterial($$renderer, {
					animation: 'Idle_Left',
					textureUrl: '/textures/sprites/punk.png',
					dataUrl: '/textures/sprites/punk.json'
				});

				$$renderer.push(`<!----> `);

				if (T.PlaneGeometry) {
					$$renderer.push('<!--[-->');
					T.PlaneGeometry($$renderer, {});
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
}