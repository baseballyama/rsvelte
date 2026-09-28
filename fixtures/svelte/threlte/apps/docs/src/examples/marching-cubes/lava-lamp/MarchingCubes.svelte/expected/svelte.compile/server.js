import * as $ from 'svelte/internal/server';
import { MarchingCube } from './MarchingCube';
import { MarchingCubes } from 'three/examples/jsm/Addons.js';
import { MarchingPlane } from './MarchingPlane';
import { MeshBasicMaterial } from 'three';
import { T, useTask } from '@threlte/core';
import { Vector3 } from 'three';

const map = { x: 'addPlaneX', y: 'addPlaneY', z: 'addPlaneZ' };
const position = new Vector3();
const defaultResolution = 50;

export default function MarchingCubes_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			resolution = defaultResolution,
			children,
			ref = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

		const material = new MeshBasicMaterial();
		const marchingCubes = new MarchingCubes(defaultResolution, material, true, true, 20_000);

		useTask(() => {
			marchingCubes.reset();

			for (const child of marchingCubes.children) {
				switch (true) {
					case child instanceof MarchingCube:
						child.getWorldPosition(position);
						position.addScalar(1).multiplyScalar(0.5);
						// center it
						marchingCubes.addBall(position.x, position.y, position.z, child.strength, child.subtract, child.color);
						break;

					case child instanceof MarchingPlane:
						marchingCubes[map[child.axis]](child.strength, child.subtract);
						break;
				}
			}

			marchingCubes.update();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: marchingCubes },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: marchingCubes });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}