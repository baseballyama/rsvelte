import * as $ from 'svelte/internal/server';
import { Grid, interactivity, OrbitControls, useCursor } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		interactivity();

		const boxPosition = new Spring([0, 0]);
		const random = () => 10 * Math.random() - 5;
		const scale = new Spring(1);
		const boxSize = 1;
		const positionY = $.derived(() => 0.5 * boxSize * scale.current);
		const { onPointerEnter, onPointerLeave } = useCursor();
		const notHoveringColor = '#ffffff';
		const hoveringColor = '#fe3d00';
		let color = notHoveringColor;

		if (T.OrthographicCamera) {
			$$renderer.push('<!--[-->');

			T.OrthographicCamera($$renderer, {
				zoom: 40,
				position: 10,
				makeDefault: true,
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

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.4 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [1, 2, 5] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				onclick: () => {
					boxPosition.target = [random(), random()];
				},

				onpointerenter: () => {
					onPointerEnter();
					scale.target = 2;
					color = hoveringColor;
				},

				onpointerleave: () => {
					onPointerLeave();
					scale.target = 1;
					color = notHoveringColor;
				},
				scale: scale.current,
				'position.x': boxPosition.current[0],
				'position.y': positionY(),
				'position.z': boxPosition.current[1],
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [boxSize, boxSize, boxSize] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color });
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

		Grid($$renderer, {
			'position.y': -1 * 0.5,
			cellColor: '#ffffff',
			sectionColor: '#ffffff',
			sectionThickness: 0,
			fadeDistance: 25,
			cellSize: 2
		});

		$$renderer.push(`<!---->`);
	});
}