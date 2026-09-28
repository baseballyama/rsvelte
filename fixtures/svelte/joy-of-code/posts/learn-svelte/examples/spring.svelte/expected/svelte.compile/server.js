import * as $ from 'svelte/internal/server';
import { Spring } from 'svelte/motion';

export default function Spring_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const size = new Spring(50, { stiffness: 0.1, damping: 0.25, precision: 0.1 });

		function onmousedown() {
			size.target = 150;
		}

		function onmouseup() {
			size.target = 50;
		}

		$$renderer.push(`<div class="container"><svg width="400" height="400" viewBox="0 0 400 400"><circle cx="200" cy="200"${$.attr('r', size.current)} fill="orangered"></circle></svg></div>`);
	});
}