import * as $ from 'svelte/internal/server';
import { useTask } from '@threlte/core';
import { Instance } from '@threlte/extras';
import { Color } from 'three';

export default function Star($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let positionX = Math.random() * 100 - 50;
		let positionY = Math.random() * 100 - 50;
		let positionZ = Math.random() * 100 - 50;
		const colors = ['#FFF09E', '#B8DFFF', '#CADBFF', '#FFEBBE'];

		// random element from array
		const color = new Color(colors[Math.floor(Math.random() * colors.length)]);

		useTask((delta) => {
			const f = 1 / 60 / delta;

			positionZ -= 15 * f;

			if (positionZ < -100) {
				positionZ = 100;
			}
		});

		Instance($$renderer, {
			color,
			'position.x': positionX,
			'position.y': positionY,
			'position.z': positionZ
		});
	});
}