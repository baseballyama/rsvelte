import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let x = 0;
	let o = { x: 0 };

	console.log(++x);
	console.log(x++);
	console.log(++o.x);
	console.log(o.x++);
	console.log(o.x += 2);
	console.log(x += 2);
}