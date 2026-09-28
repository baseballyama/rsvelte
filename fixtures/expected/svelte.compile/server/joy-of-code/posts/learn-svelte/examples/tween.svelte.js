import * as $ from 'svelte/internal/server';
import { Tween } from 'svelte/motion';
import { cubicInOut } from 'svelte/easing';

export default function Tween_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const size = new Tween(50, { duration: 300, easing: cubicInOut });

		function onmousedown() {
			size.target = 150;
		}

		function onmouseup() {
			size.target = 50;
		}

		$$renderer.push(`<div class="container"><svg width="400" height="400" viewBox="0 0 400 400"><circle cx="200" cy="200"${$.attr('r', size.current)} fill="orangered"></circle></svg></div>`);
	});
}