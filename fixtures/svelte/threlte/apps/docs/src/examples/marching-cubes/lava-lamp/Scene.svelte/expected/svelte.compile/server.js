import * as $ from 'svelte/internal/server';
import MarchingCubes from './MarchingCubes.svelte';
import MarchingPlane from './MarchingPlane.svelte';
import { Color } from 'three';
import { Environment, OrbitControls } from '@threlte/extras';
import { MarchingCube } from './MarchingCube';
import { T, useTask } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ballCount = 5,
			isolation = 80,
			planeAxis = 'y',
			resolution = 50
		} = $$props;

		const randomColor = () => {
			return new Color().setRGB(Math.random(), Math.random(), Math.random());
		};

		/**
		 * creates `count` randomly colored balls that are evenly distributed around a unit circle scaled by `scale`
		 */
		const createBalls = (count, scale = 0.5) => {
			const balls = [];
			const m = 2 * Math.PI / count;

			for (let i = 0; i < count; i += 1) {
				const ball = new MarchingCube(randomColor());
				const r = m * i;
				const x = Math.cos(r);
				const y = Math.sin(r);

				ball.position.set(x, 0, y).multiplyScalar(scale);
				balls.push(ball);
			}

			return balls;
		};

		const balls = $.derived(() => createBalls(ballCount));
		let time = 0;

		useTask((delta) => {
			time += delta;

			let i = 0;

			for (const ball of balls()) {
				ball.position.setY(0.5 * Math.sin(time + i) - 0.5);
				i += 1;
			}
		});

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				'position.z': 5,
				children: ($$renderer) => {
					OrbitControls($$renderer, { autoRotate: true });
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
			url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
		});

		$$renderer.push(`<!----> `);

		MarchingCubes($$renderer, {
			enableColors: true,
			resolution,
			isolation,
			children: ($$renderer) => {
				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, { vertexColors: true });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <!--[-->`);

				const each_array = $.ensure_array_like(balls());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let ball = each_array[$$index];

					T($$renderer, { is: ball });
				}

				$$renderer.push(`<!--]--> `);
				MarchingPlane($$renderer, { axis: planeAxis });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}