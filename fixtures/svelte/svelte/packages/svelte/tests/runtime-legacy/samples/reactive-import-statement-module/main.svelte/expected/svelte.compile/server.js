import * as $ from 'svelte/internal/server';
import state from './state.js';

function update() {
	state.count += 1;
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<button>${$.escape(state.count)}</button>`);
	});
}