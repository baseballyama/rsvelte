import * as $ from 'svelte/internal/server';
import { Renderer, Program, Mesh, Triangle, Transform, Vec3, Camera } from 'ogl';

function parseHexColor(hex) {
	const c = hex.replace('#', '');

	return [
		parseInt(c.substring(0, 2), 16) / 255,
		parseInt(c.substring(2, 4), 16) / 255,
		parseInt(c.substring(4, 6), 16) / 255
	];
}

const fract = (x) => x - Math.floor(x);

function hash31(p) {
	const r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);
	const ryzx = [r[1], r[2], r[0]];
	const dot = r[0] * (ryzx[0] + 33.33) + r[1] * (ryzx[1] + 33.33) + r[2] * (ryzx[2] + 33.33);

	for (let i = 0; i < 3; i++) r[i] = fract(r[i] + dot);

	return r;
}

function hash33(v) {
	const p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);
	const pyxz = [p[1], p[0], p[2]];
	const dot = p[0] * (pyxz[0] + 33.33) + p[1] * (pyxz[1] + 33.33) + p[2] * (pyxz[2] + 33.33);

	for (let i = 0; i < 3; i++) p[i] = fract(p[i] + dot);

	const pxxy = [p[0], p[0], p[1]];
	const pyxx = [p[1], p[0], p[0]];
	const pzyx = [p[2], p[1], p[0]];
	const r = [];

	for (let i = 0; i < 3; i++) r[i] = fract((pxxy[i] + pyxx[i]) * pzyx[i]);

	return r;
}

export default function MetaBalls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			color = '#ffffff',
			speed = 0.3,
			enableMouseInteraction = true,
			hoverSmoothness = 0.05,
			animationSize = 30,
			ballCount = 15,
			clumpFactor = 1,
			cursorBallSize = 3,
			cursorBallColor = '#ffffff',
			enableTransparency = false
		} = $$props;

		let container;

		$$renderer.push(`<div class="absolute inset-0"></div>`);
	});
}