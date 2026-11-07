import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Tween } from 'svelte/motion';

export default function Lights($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { machineIsOff = false, pointLightsOff = false, lightColor } = $$props;
		let pointLightIntensity = Tween.of(() => pointLightsOff ? 1 : 0);
		const options = { duration: 3e3 };
		const blueLightIntensity = Tween.of(() => machineIsOff ? 0 : 2, options);
		const redLightIntensity = Tween.of(() => machineIsOff ? 0 : 2, options);
		const whiteLightIntensity = Tween.of(() => machineIsOff ? 0 : 1, options);
		const whiteAmbientLightIntensity = Tween.of(() => machineIsOff ? 0 : 1, options);

		if (T.PointLight) {
			$$renderer.push('<!--[-->');

			T.PointLight($$renderer, {
				args: ['black'],
				'position.y': 1.37,
				'position.z': -0.12,
				intensity: 25 * pointLightIntensity.current,
				distance: 1.2,
				decay: 2,
				color: lightColor
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 8, color: lightColor });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');

			T.AmbientLight($$renderer, {
				intensity: whiteAmbientLightIntensity.current,
				color: 'white'
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
				intensity: redLightIntensity.current,
				color: '#F67F55',
				position: [-2.2, 3.6, 2.6]
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
				intensity: blueLightIntensity.current,
				position: [2.2, 3.4, 2.6],
				color: '#2722F3'
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
				intensity: whiteLightIntensity.current,
				position: [-1, 2.5, 1],
				color: 'white'
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}