import * as $ from 'svelte/internal/server';
import * as THREE from 'three';

export default function LiquidEther($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/* eslint-disable @typescript-eslint/no-explicit-any */
		/* eslint-disable svelte/no-unused-svelte-ignore */
		const defaultColors = ['#FF8A4C', '#FFC18A', '#FF6B2C'];

		let {
			mouseForce = 20,
			cursorSize = 100,
			isViscous = false,
			viscous = 30,
			iterationsViscous = 32,
			iterationsPoisson = 32,
			dt = 0.014,
			BFECC = true,
			resolution = 0.5,
			isBounce = false,
			colors = defaultColors,
			class: className = '',
			autoDemo = true,
			autoSpeed = 0.5,
			autoIntensity = 2.2,
			takeoverDuration = 0.25,
			autoResumeDelay = 1000,
			autoRampDuration = 0.6
		} = $$props;

		let mountRef;
		let webglRef = null;
		let resizeObserverRef = null;
		let rafRef = null;
		let intersectionObserverRef = null;
		let isVisibleRef = true;
		let resizeRafRef = null;

		$$renderer.push(`<div${$.attr_class(`relative h-full w-full overflow-hidden pointer-events-none touch-none ${$.stringify(
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			// svelte-ignore perf_avoid_nested_class
			/* noop */
			/* noop */
			/* noop */
			className
		)}`)}></div>`);
	});
}