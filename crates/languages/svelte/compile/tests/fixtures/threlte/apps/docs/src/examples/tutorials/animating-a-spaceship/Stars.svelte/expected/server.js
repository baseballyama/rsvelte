import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { Instance, InstancedMesh, useTexture } from '@threlte/extras';
import { Color, DoubleSide, MathUtils } from 'three';

export default function Stars($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let STARS_COUNT = 350;
		let colors = ['#fcaa67', '#C75D59', '#ffffc7', '#8CC5C6', '#A5898C'];
		let stars = [];
		const map = useTexture('/spaceship-tutorial/textures/star.png');

		function r(min, max) {
			let diff = Math.random() * (max - min);

			return min + diff;
		}

		function resetStar(star) {
			if (r(0, 1) > 0.8) {
				star.position = [r(-10, -30), r(-5, 5), r(6, -6)];
				star.length = r(1.5, 15);
			} else {
				star.position = [r(-15, -45), r(-10.5, 1.5), r(30, -45)];
				star.length = r(2.5, 20);
			}

			star.speed = r(19.5, 42);
			star.color.set(colors[Math.floor(Math.random() * colors.length)] ?? 'white').convertSRGBToLinear().multiplyScalar(1.3);
		}

		for (let i = 0; i < STARS_COUNT; i++) {
			const star = {
				id: MathUtils.generateUUID(),
				position: [0, 0, 0],
				length: 0,
				speed: 0,
				color: new Color()
			};

			resetStar(star);
			stars.push(star);
		}

		useTask((delta) => {
			for (const star of stars) {
				star.position[0] += star.speed * delta;

				if (star.position[0] > 40) {
					resetStar(star);
				}
			}
		});

		$.await($$renderer, map, () => {}, (value) => {
			InstancedMesh($$renderer, {
				limit: STARS_COUNT,
				range: STARS_COUNT,
				children: ($$renderer) => {
					if (T.PlaneGeometry) {
						$$renderer.push('<!--[-->');
						T.PlaneGeometry($$renderer, { args: [1, 0.05] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshBasicMaterial($$renderer, { side: DoubleSide, alphaMap: value, transparent: true });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <!--[-->`);

					const each_array = $.ensure_array_like(stars);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let { id, position, length, color } = each_array[$$index];

						Instance($$renderer, { position, scale: [length, 1, 1], color });
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		});

		$$renderer.push(`<!--]-->`);
	});
}