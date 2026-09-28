import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Gizmo, OrbitControls } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	let {
		autoRotate,
		enableDamping,
		rotateSpeed,
		zoomToCursor,
		zoomSpeed,
		minPolarAngle,
		maxPolarAngle,
		enableZoom
	} = $$props;

	if (T.PerspectiveCamera) {
		$$renderer.push('<!--[-->');

		T.PerspectiveCamera($$renderer, {
			makeDefault: true,
			position: [10, 5, 10],
			'lookAt.y': 0.5,
			children: ($$renderer) => {
				OrbitControls($$renderer, {
					enableDamping,
					autoRotate,
					rotateSpeed,
					zoomToCursor,
					zoomSpeed,
					minPolarAngle,
					maxPolarAngle,
					enableZoom,
					children: ($$renderer) => {
						Gizmo($$renderer, {});
					},
					$$slots: { default: true }
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
		T.DirectionalLight($$renderer, { 'position.y': 10, 'position.z': 10 });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.AmbientLight) {
		$$renderer.push('<!--[-->');
		T.AmbientLight($$renderer, { intensity: 0.3 });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.GridHelper) {
		$$renderer.push('<!--[-->');
		T.GridHelper($$renderer, { args: [10, 10] });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			'position.y': 1,
			children: ($$renderer) => {
				if (T.BoxGeometry) {
					$$renderer.push('<!--[-->');
					T.BoxGeometry($$renderer, { args: [2, 2, 2] });
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
}