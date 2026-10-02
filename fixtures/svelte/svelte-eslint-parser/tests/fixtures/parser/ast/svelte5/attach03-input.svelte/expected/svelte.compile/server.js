import * as $ from 'svelte/internal/server';
import { paint } from './gradient.js';

export default function Attach03_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<canvas${$.attr('width', 32)}${$.attr('height', 32)}></canvas>`);
	});
}