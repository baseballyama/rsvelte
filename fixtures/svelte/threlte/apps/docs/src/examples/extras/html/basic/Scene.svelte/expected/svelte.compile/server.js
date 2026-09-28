import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { HTML, OrbitControls } from '@threlte/extras';
import { Spring } from 'svelte/motion';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { autoRender = true } = $$props;
		const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
		let color = getRandomColor();
		let isHovering = false;
		let isPointerDown = false;
		const htmlPosZ = Spring.of(() => isPointerDown ? -0.15 : isHovering ? -0.075 : 0);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				position: [10, 5, 10],
				makeDefault: true,
				fov: 30,
				oncreate: (ref) => ref.lookAt(0, 0.75, 0),
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						'target.y': 0.75,
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

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [0, 10, 10] });
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
			T.GridHelper($$renderer, {});
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
				children: ($$renderer) => {
					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.SphereGeometry) {
						$$renderer.push('<!--[-->');
						T.SphereGeometry($$renderer, { args: [0.5] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					HTML($$renderer, {
						'position.y': 1.25,
						'position.z': htmlPosZ.current,
						transform: true,
						autoRender,
						children: ($$renderer) => {
							$$renderer.push(`<button class="cursor-pointer rounded-full bg-orange-500 px-3 text-white hover:opacity-90 active:opacity-70">I'm a regular HTML button</button>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					HTML($$renderer, {
						'position.x': 0.75,
						transform: true,
						pointerEvents: 'none',
						autoRender,
						children: ($$renderer) => {
							$$renderer.push(`<p class="w-auto translate-x-1/2 text-xs drop-shadow-lg"${$.attr_style(`color: ${$.stringify(color)}`)}>color: ${$.escape(color)}</p>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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