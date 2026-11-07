import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function makeColor() {
		console.log("makeColor()");

		return "red";
	}

	let size = '1em';

	$$renderer.push(`<button>click</button> <div${$.attr_style('', { 'background-color': makeColor(), 'font-size': size })}></div>`);
}