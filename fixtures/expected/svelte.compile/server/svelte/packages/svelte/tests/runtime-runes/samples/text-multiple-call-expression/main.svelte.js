import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let x = 0;
	let y = 0;

	function getX() {
		console.log('x');

		return x;
	}

	function getY() {
		console.log('y');

		return y;
	}

	$$renderer.push(`<button>${$.escape(x)}</button> <button>${$.escape(y)}</button> ${$.escape(getX())}|${$.escape(getY())}`);
}