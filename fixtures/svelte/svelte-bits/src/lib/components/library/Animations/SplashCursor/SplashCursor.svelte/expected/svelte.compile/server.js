import * as $ from 'svelte/internal/server';

function pointerPrototype() {
	return {
		id: -1,
		texcoordX: 0,
		texcoordY: 0,
		prevTexcoordX: 0,
		prevTexcoordY: 0,
		deltaX: 0,
		deltaY: 0,
		down: false,
		moved: false,
		color: { r: 0, g: 0, b: 0 }
	};
}

export default function SplashCursor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/* eslint-disable @typescript-eslint/no-explicit-any */
		/* eslint-disable svelte/no-unused-svelte-ignore */
		let {
			SIM_RESOLUTION = 128,
			DYE_RESOLUTION = 1440,
			CAPTURE_RESOLUTION = 512,
			DENSITY_DISSIPATION = 3.5,
			VELOCITY_DISSIPATION = 2,
			PRESSURE = 0.1,
			PRESSURE_ITERATIONS = 20,
			CURL = 3,
			SPLAT_RADIUS = 0.2,
			SPLAT_FORCE = 6000,
			SHADING = true,
			COLOR_UPDATE_SPEED = 10,
			BACK_COLOR = { r: 0.5, g: 0, b: 0 },
			TRANSPARENT = true,
			RAINBOW_MODE = true,
			COLOR = '#ff0000'
		} = $$props;

		let canvasRef;

		$$renderer.push(`<div class="pointer-events-none fixed left-0 top-0 z-50 h-full w-full"><canvas id="fluid" class="block h-screen w-screen"></canvas></div>`);
		// svelte-ignore perf_avoid_nested_class
		// svelte-ignore perf_avoid_nested_class
	});
}