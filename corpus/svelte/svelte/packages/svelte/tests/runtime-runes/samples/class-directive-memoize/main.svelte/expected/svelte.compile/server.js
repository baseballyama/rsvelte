import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function is_red() {
		console.log("is_red()");

		return "red";
	}

	let active = false;

	$$renderer.push(`<button>click</button> <div${$.attr_class('', void 0, { 'red': is_red(), 'active': active })}></div>`);
}