import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let clickHandler;
	let number = 0;

	function updateHandler1() {
		clickHandler = () => number = 1;
	}

	function updateHandler2() {
		clickHandler = () => number = 2;
	}

	$$renderer.push(`<p><button>set handler 1</button> <button>set handler 2</button></p> <p>${$.escape(number)}</p> <button>click</button>`);
}