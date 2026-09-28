import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	let obj = { onclick: () => count++ };

	$$renderer.push(`<button${$.attributes({ ...obj })}>${$.escape(count)}</button> <button>change handler</button>`);
}