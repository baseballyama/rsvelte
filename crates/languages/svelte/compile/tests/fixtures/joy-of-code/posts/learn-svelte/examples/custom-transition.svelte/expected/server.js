import * as $ from 'svelte/internal/server';
import { elasticOut } from 'svelte/easing';

export default function Custom_transition($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function customTransition(node, options) {
			const { duration = 2000, delay = 0, easing = elasticOut } = options;

			return {
				duration,
				delay,
				easing,
				css: (t) => `
				color: hsl(${360 * t} , 100%, 80%);
				transform: scale(${t});
			`
			};
		}

		let play = false;
		let replay = false;

		$$renderer.push(`<div class="container">`);

		if (play) {
			$$renderer.push(`<!--[0--><!---->`);

			{
				$$renderer.push(`<div class="text svelte-1hdyhhy">Whoooo!</div>`);
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button class="svelte-1hdyhhy">Replay</button></div>`);
	});
}