import * as $ from 'svelte/internal/server';
import { handler, log_a, log_b } from './event.svelte.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<button>click</button> <button>change</button> <button>change back</button>`);
	});
}