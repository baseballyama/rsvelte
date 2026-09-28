import * as $ from 'svelte/internal/server';

export default function _page($$renderer) {
	$$renderer.push(`<button>button 1</button> <button>button 2</button> <p id="p">cannot be focused</p> <button id="button3">button 3</button>`);
}