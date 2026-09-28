import * as $ from 'svelte/internal/server';
import { Renderer, Transform, Vec3, Color, Polyline } from 'ogl';

export default function Ribbons($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			colors = ['#ff9346', '#7cff67', '#ffee51', '#FF8A4C'],
			baseSpring = 0.03,
			baseFriction = 0.9,
			baseThickness = 30,
			offsetFactor = 0.05,
			maxAge = 500,
			pointCount = 50,
			speedMultiplier = 0.6,
			enableFade = false,
			enableShaderEffect = false,
			effectAmplitude = 2,
			backgroundColor = [0, 0, 0, 0]
		} = $$props;

		let container;

		$$renderer.push(`<div class="absolute inset-0"></div>`);
	});
}